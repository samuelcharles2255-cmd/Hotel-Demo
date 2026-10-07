from rest_framework import filters, generics, mixins, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .permissions import IsHotelStaff
from .serializers import CustomerAdminSerializer, RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_scope = "register"


class LoginView(TokenObtainPairView):
    throttle_scope = "login"


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class CustomerViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                      mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """Staff: list/search customers, deactivate/reactivate (PATCH is_active).
    No delete: bookings and payments must keep their history.
    Role changes are NOT possible here on purpose - do that in Django admin."""

    permission_classes = [IsHotelStaff]
    serializer_class = CustomerAdminSerializer
    queryset = User.objects.filter(role=User.Role.CUSTOMER).order_by("-date_joined")
    filter_backends = [filters.SearchFilter]
    search_fields = ("email", "first_name", "last_name", "phone")
    http_method_names = ["get", "patch", "head", "options"]