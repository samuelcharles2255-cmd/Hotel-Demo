from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CheckoutView, StaffPaymentViewSet, WebhookView

router = DefaultRouter()
router.register(r"staff", StaffPaymentViewSet, basename="staff-payment")

urlpatterns = [
    path("checkout/", CheckoutView.as_view(), name="payment-checkout"),
    path("webhook/<str:provider>/", WebhookView.as_view(), name="payment-webhook"),
    path("", include(router.urls)),
]

