from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "booking",
        "kind",
        "status",
        "method",
        "provider",
        "amount",
        "currency",
        "paid_at",
        "created_at",
    )
    list_filter = ("status", "kind", "method", "provider", "currency")
    search_fields = ("booking__reference", "provider_reference", "idempotency_key")
    readonly_fields = ("idempotency_key", "created_at")

