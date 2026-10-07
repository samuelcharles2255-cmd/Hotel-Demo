from django.contrib import admin

from .models import Booking, Guest


class GuestInline(admin.TabularInline):
    model = Guest
    extra = 0


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "reference",
        "customer",
        "room",
        "check_in",
        "check_out",
        "status",
        "total_amount",
        "currency",
        "created_at",
    )
    list_filter = ("status", "currency", "check_in")
    search_fields = ("reference", "customer__email", "room__number", "guests__email", "guests__last_name")
    readonly_fields = ("reference", "access_token", "created_at", "updated_at")
    inlines = [GuestInline]


@admin.register(Guest)
class GuestAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "email", "phone", "booking", "is_primary")
    list_filter = ("is_primary",)
    search_fields = ("first_name", "last_name", "email", "booking__reference")

