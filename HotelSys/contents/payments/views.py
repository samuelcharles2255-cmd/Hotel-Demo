import logging

from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from users.permissions import IsHotelStaff

from .models import Payment
from .providers import InvalidWebhook, UnknownProvider, get_provider
from .serializers import CheckoutSerializer, PaymentSerializer
from .services import apply_event, resolve_booking, start_checkout

log = logging.getLogger(__name__)


class CheckoutView(generics.GenericAPIView):
    """VISITOR or CUSTOMER: start paying a pending booking. Returns the provider's checkout URL."""

    serializer_class = CheckoutSerializer
    permission_classes = [AllowAny]
    throttle_scope = "checkout"

    def post(self, request):
        s = self.get_serializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        booking = resolve_booking(request, d["booking_reference"], d.get("access_token"))
        payment, url = start_checkout(booking=booking, method=d["method"], provider_name=d["provider"],
                                      idempotency_key=d["idempotency_key"])
        return Response({"payment_id": payment.pk, "status": payment.status, "checkout_url": url})


class WebhookView(APIView):
    """Provider -> us. This, not the browser redirect, is the ONLY thing that confirms a paid booking."""

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = []

    def post(self, request, provider):
        try:
            event = get_provider(provider).parse_webhook(request)
        except (UnknownProvider, InvalidWebhook):
            return Response(status=400)
        try:
            apply_event(provider, event)
        except Payment.DoesNotExist:
            # 404 on purpose: providers retry non-2xx, which covers the tiny window where the
            # webhook arrives before we've saved provider_reference.
            log.warning("Webhook for unknown payment %s/%s", provider, event.provider_reference)
            return Response(status=404)
        return Response(status=200)


class StaffPaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """STAFF: view payments. Read-only: no endpoint can edit or delete financial records."""

    permission_classes = [IsHotelStaff]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        qs, p = Payment.objects.select_related("booking").order_by("-created_at"), self.request.query_params
        if p.get("booking"):
            qs = qs.filter(booking__reference=p["booking"])
        if p.get("status"):
            qs = qs.filter(status=p["status"])
        return qs
    