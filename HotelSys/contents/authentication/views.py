import uuid

from django.contrib.auth.tokens import default_token_generator
from django.core import signing
from django.db import IntegrityError, transaction
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import filters, generics, mixins, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken

from .emails import (read_verification_token, send_account_exists_email, send_password_reset_email,
                     send_verification_email)
from users.models import User
from users.permissions import IsHotelStaff
from .serializers import (CustomerAdminSerializer, EmailTokenObtainPairSerializer, PasswordChangeSerializer,
                          PasswordResetConfirmSerializer, PasswordResetRequestSerializer, RegisterSerializer,
                          UserSerializer, VerifyEmailSerializer, check_new_password)
from .services import claim_guest_bookings
from .throttles import LoginEmailThrottle, ResetEmailThrottle
from .tokens import REFRESH_COOKIE, clear_refresh_cookie, revoke_all_tokens, set_refresh_cookie

GENERIC_INVALID_LINK = {"detail": "This link is invalid or has expired."}


class PublicAPIView(APIView):
    """Auth endpoints are called without a valid access token, so skip JWT auth on them."""
    permission_classes = [AllowAny]
    authentication_classes = []


# ------------------------------------------------------------------ register / verify
class RegisterView(PublicAPIView):
    throttle_scope = "register"

    def post(self, request):
        s = RegisterSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        user, existing = None, User.objects.filter(email__iexact=d["email"]).first()
        if existing is None:
            try:
                with transaction.atomic():
                    user = User(username=uuid.uuid4().hex, email=d["email"], role=User.Role.CUSTOMER,
                                first_name=d["first_name"], last_name=d["last_name"], phone=d["phone"])
                    user.set_password(d["password"])
                    user.save()
            except IntegrityError:  # two simultaneous signups with the same email
                user, existing = None, User.objects.filter(email__iexact=d["email"]).first()
        if user:
            send_verification_email(user)
        elif existing:
            send_account_exists_email(existing)
        # Identical response either way: registration must not reveal which emails have accounts.
        return Response({"detail": "Check your email to finish setting up your account."},
                        status=status.HTTP_202_ACCEPTED)


class VerifyEmailView(PublicAPIView):
    throttle_scope = "verify"

    def post(self, request):
        s = VerifyEmailSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        try:
            data = read_verification_token(s.validated_data["token"])
        except signing.BadSignature:
            return Response(GENERIC_INVALID_LINK, status=400)
        user = User.objects.filter(pk=data["uid"], email=data["email"], is_active=True).first()
        if user is None:
            return Response(GENERIC_INVALID_LINK, status=400)
        with transaction.atomic():
            if not user.email_verified:
                user.email_verified = True
                user.save(update_fields=["email_verified"])
            linked = claim_guest_bookings(user)
        return Response({"detail": "Email verified.", "bookings_linked": linked})


class ResendVerificationView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "verify"

    def post(self, request):
        if not request.user.email_verified:
            send_verification_email(request.user)
        return Response({"detail": "If your email still needs verifying, we've sent a new link."},
                        status=status.HTTP_202_ACCEPTED)


# ------------------------------------------------------------------ login / refresh / logout
class LoginView(PublicAPIView):
    """Access token in the JSON body (keep it in memory, 15 min).
    Refresh token ONLY in an HttpOnly cookie (never readable by page JavaScript)."""

    throttle_scope = "login"
    throttle_classes = [ScopedRateThrottle, LoginEmailThrottle]

    def post(self, request):
        s = EmailTokenObtainPairSerializer(data=request.data)
        try:
            s.is_valid(raise_exception=True)
        except TokenError as exc:
            raise InvalidToken(exc.args[0])
        if s.user.email_verified:
            claim_guest_bookings(s.user)
        response = Response({"access": s.validated_data["access"], "user": UserSerializer(s.user).data})
        set_refresh_cookie(response, s.validated_data["refresh"])
        return response


class RefreshView(PublicAPIView):
    throttle_scope = "refresh"

    def post(self, request):
        raw = request.COOKIES.get(REFRESH_COOKIE) or request.data.get("refresh")
        try:
            if not raw:
                raise TokenError("missing")
            token = RefreshToken(raw)  # verifies signature, expiry AND the blacklist
            User.objects.get(pk=token[api_settings.USER_ID_CLAIM], is_active=True)
            s = TokenRefreshSerializer(data={"refresh": raw})
            s.is_valid(raise_exception=True)
        except (TokenError, User.DoesNotExist, InvalidToken, KeyError):
            response = Response({"detail": "Session expired. Please log in again."}, status=401)
            clear_refresh_cookie(response)
            return response
        data = {"access": s.validated_data["access"]}
        response = Response(data)
        if "refresh" in s.validated_data:
            set_refresh_cookie(response, s.validated_data["refresh"])
        return response


class LogoutView(PublicAPIView):
    def post(self, request):
        raw = request.COOKIES.get(REFRESH_COOKIE)
        if raw:
            try:
                RefreshToken(raw).blacklist()
            except TokenError:
                pass
        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_refresh_cookie(response)
        return response


class LogoutAllView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        revoke_all_tokens(request.user)
        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_refresh_cookie(response)
        return response


# ------------------------------------------------------------------ passwords
class PasswordResetRequestView(PublicAPIView):
    throttle_scope = "password_reset"
    throttle_classes = [ScopedRateThrottle, ResetEmailThrottle]

    def post(self, request):
        s = PasswordResetRequestSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=s.validated_data["email"], is_active=True).first()
        if user:
            send_password_reset_email(user)
        return Response({"detail": "If that email has an account, a reset link is on its way."},
                        status=status.HTTP_202_ACCEPTED)


class PasswordResetConfirmView(PublicAPIView):
    throttle_scope = "password_reset"

    def post(self, request):
        s = PasswordResetConfirmSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        try:
            user = User.objects.filter(pk=force_str(urlsafe_base64_decode(d["uid"])), is_active=True).first()
        except (ValueError, TypeError, OverflowError, UnicodeDecodeError):
            user = None
        if user is None or not default_token_generator.check_token(user, d["token"]):
            return Response(GENERIC_INVALID_LINK, status=400)
        check_new_password(d["password"], user)
        with transaction.atomic():
            user.set_password(d["password"])
            user.email_verified = True  # they just proved they control the inbox
            user.save(update_fields=["password", "email_verified"])
            revoke_all_tokens(user)     # a stolen session must not survive a password reset
            claim_guest_bookings(user)
        return Response({"detail": "Password updated. Please log in."})


class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "password_change"

    def post(self, request):
        s = PasswordChangeSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        if not request.user.check_password(d["old_password"]):
            return Response({"old_password": ["Incorrect password."]}, status=400)
        check_new_password(d["new_password"], request.user, field="new_password")
        with transaction.atomic():
            request.user.set_password(d["new_password"])
            request.user.save(update_fields=["password"])
            revoke_all_tokens(request.user)
        response = Response({"detail": "Password changed. Please log in again."})
        clear_refresh_cookie(response)
        return response


# ------------------------------------------------------------------ profile / staff
class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class CustomerViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                      mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """Staff: list/search customers, deactivate/reactivate (PATCH is_active).
    Deactivating blocks login and refresh; an already-issued access token lives until it expires (15 min).
    No delete: bookings and payments must keep their history. Role changes: Django admin only."""

    permission_classes = [IsHotelStaff]
    serializer_class = CustomerAdminSerializer
    queryset = User.objects.filter(role=User.Role.CUSTOMER).order_by("-date_joined")
    filter_backends = [filters.SearchFilter]
    search_fields = ("email", "first_name", "last_name", "phone")
    http_method_names = ["get", "patch", "head", "options"]
