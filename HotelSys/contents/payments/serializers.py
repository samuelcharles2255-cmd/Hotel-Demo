import uuid
from rest_framework import serializers

from .models import Payment


class CheckoutSerializer(serializers.Serializer):
    booking_reference = serializers.CharField(max_length=16)
    access_token = serializers.UUIDField(required=False, allow_null=True, default=None)
    method = serializers.ChoiceField(choices=Payment.Method.choices)
    provider = serializers.CharField(default="dummy")
    idempotency_key = serializers.UUIDField(default=uuid.uuid4)


class PaymentSerializer(serializers.ModelSerializer):
    booking_reference = serializers.CharField(source="booking.reference", read_only=True)

    class Meta:
        model = Payment
        fields = (
            "id",
            "booking",
            "booking_reference",
            "kind",
            "status",
            "method",
            "provider",
            "provider_reference",
            "amount",
            "currency",
            "idempotency_key",
            "provider_payload",
            "failure_reason",
            "created_at",
            "paid_at",
        )
        read_only_fields = fields

