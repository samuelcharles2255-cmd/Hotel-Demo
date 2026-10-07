import uuid

from django.db import models


class Payment(models.Model):
    """Records an attempt/result from a payment provider.
    NEVER store card numbers, CVV or raw card data. Provider tokens/references only."""

    class Kind(models.TextChoices):
        CHARGE = "charge", "Charge"
        REFUND = "refund", "Refund"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCEEDED = "succeeded", "Succeeded"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    class Method(models.TextChoices):
        CARD = "card", "Card"
        MOBILE_MONEY = "mobile_money", "Mobile money"
        BANK_TRANSFER = "bank_transfer", "Bank transfer"
        CASH = "cash", "Cash (at hotel)"

    booking = models.ForeignKey("bookings.Booking", on_delete=models.PROTECT, related_name="payments")
    kind = models.CharField(max_length=8, choices=Kind.choices, default=Kind.CHARGE)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    method = models.CharField(max_length=16, choices=Method.choices)
    provider = models.CharField(max_length=50, blank=True)  # e.g. "stripe", "flutterwave"
    provider_reference = models.CharField(max_length=200, blank=True, db_index=True)

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3)

    # Client generates/sends this so retries and double-clicks can't double-charge.
    idempotency_key = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    provider_payload = models.JSONField(default=dict, blank=True)  # webhook body for audits
    failure_reason = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(amount__gt=0), name="payment_amount_positive"),
            models.UniqueConstraint(
                fields=["provider", "provider_reference"],
                condition=~models.Q(provider_reference=""),
                name="uniq_provider_reference",
            ),
        ]