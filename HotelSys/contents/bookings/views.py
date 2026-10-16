from django.db.models import Q
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.serializers import DateField

from users.models import User
from users.permissions import IsHotelStaff

from .models import Booking
from .serializers import (BookingCreatedSerializer, BookingCreateSerializer, BookingSerializer,
                          CancelSerializer, LookupSerializer, StaffBookingSerializer)
from .services import cancel_booking, confirm_booking, create_booking


def base_qs():
    return Booking.objects.select_related("room", "room_type__hotel", "customer").prefetch_related(
        "guests", "payments")


class BookingCreateView(generics.GenericAPIView):
    """VISITOR or CUSTOMER: create a booking (status=pending, room held). Pay next."""

    serializer_class = BookingCreateSerializer
    permission_classes = [AllowAny]
    throttle_scope = "booking_create"

    def post(self, request):
        s = self.get_serializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = request.user
        customer = user if (user.is_authenticated and user.role == User.Role.CUSTOMER) else None
        booking = create_booking(customer=customer, **s.validated_data)
        return Response(BookingCreatedSerializer(booking, context={"request": request}).data,
                        status=status.HTTP_201_CREATED)


class BookingLookupView(generics.GenericAPIView):
    """VISITOR: view a booking with reference + access_token (POST so the token stays out of URLs/logs)."""

    serializer_class = LookupSerializer
    permission_classes = [AllowAny]
    throttle_scope = "booking_lookup"

    def post(self, request):
        s = self.get_serializer(data=request.data)
        s.is_valid(raise_exception=True)
        booking = base_qs().filter(**s.validated_data).first()
        if booking is None:
            raise NotFound("Booking not found.")
        return Response(BookingSerializer(booking, context={"request": request}).data)


class MyBookingViewSet(viewsets.ReadOnlyModelViewSet):
    """CUSTOMER: own bookings only. Filtering in get_queryset IS the access control."""

    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "reference"

    def get_queryset(self):
        return base_qs().filter(customer=self.request.user).order_by("-created_at")

    @action(detail=True, methods=["post"])
    def cancel(self, request, reference=None):
        s = CancelSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        booking, refund_review = cancel_booking(
            self.get_object(), by=request.user, reason=s.validated_data["reason"])
        return Response({"booking": BookingSerializer(booking).data, "refund_review": refund_review})


def _date(value):
    return DateField().to_internal_value(value)  # bad input -> 400, not 500


class StaffBookingViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsHotelStaff]
    serializer_class = StaffBookingSerializer
    lookup_field = "reference"

    def get_queryset(self):
        qs, p = base_qs().order_by("-created_at"), self.request.query_params
        if p.get("status"):
            qs = qs.filter(status=p["status"])
        if p.get("check_in_from"):
            qs = qs.filter(check_in__gte=_date(p["check_in_from"]))
        if p.get("check_in_to"):
            qs = qs.filter(check_in__lte=_date(p["check_in_to"]))
        if p.get("q"):
            q = p["q"]
            qs = qs.filter(Q(reference__icontains=q) | Q(guests__email__icontains=q)
                           | Q(guests__last_name__icontains=q) | Q(customer__email__icontains=q)).distinct()
        return qs

    @action(detail=True, methods=["post"])
    def confirm(self, request, reference=None):
        booking = confirm_booking(self.get_object(), by=request.user)
        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, reference=None):
        s = CancelSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        booking, refund_review = cancel_booking(
            self.get_object(), by=request.user, reason=s.validated_data["reason"], as_staff=True)
        return Response({"booking": self.get_serializer(booking).data, "refund_review": refund_review})

    @action(detail=True, methods=["post"])
    def complete(self, request, reference=None):
        booking = self.get_object()
        booking.status = Booking.Status.COMPLETED
        booking.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(booking).data)