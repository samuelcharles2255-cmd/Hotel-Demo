import secrets
import uuid

from django.conf import settings
from django.contrib.postgres.constraints import ExclusionConstraint
from django.contrib.postgres.fields import DateRangeField, RangeBoundary, RangeOperators
from django.db import models
from django.db.models import F, Func, Q


class DateRange(Func):
    function = "DATERANGE"
    output_field = DateRangeField()


def generate_reference():
    # e.g. "HB-7K2Q9XF4" - unambiguous characters, shown to the customer
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "HB-" + "".join(secrets.choice(alphabet) for _ in range(8))


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending payment"
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"
        NO_SHOW = "no_show", "No-show"
        EXPIRED = "expired", "Expired (unpaid)"

    # Statuses that occupy the room. Used by the anti-double-booking constraint.
    ACTIVE_STATUSES = ("pending", "confirmed")

    reference = models.CharField(max_length=16, unique=True, default=generate_reference, editable=False)
    # Visitors book without an account -> nullable. They look up via reference + access_token/email.
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="bookings",
    )
    access_token = models.UUIDField(default=uuid.uuid4, editable=False)

    room = models.ForeignKey("hotels.Room", on_delete=models.PROTECT, related_name="bookings")
    room_type = models.ForeignKey("hotels.RoomType", on_delete=models.PROTECT, related_name="bookings")

    check_in = models.DateField()
    check_out = models.DateField()  # exclusive: a stay 1st->3rd = 2 nights
    adults = models.PositiveSmallIntegerField(default=1)
    children = models.PositiveSmallIntegerField(default=0)
    special_requests = models.TextField(blank=True)

    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    hold_expires_at = models.DateTimeField(null=True, blank=True)  # unpaid holds die here

    # Price SNAPSHOT. Staff changing RoomType.base_price must never alter existing bookings.
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3)

    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )
    cancellation_reason = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["room", "check_in", "check_out"]),
            models.Index(fields=["status", "hold_expires_at"]),
        ]
        constraints = [
            models.CheckConstraint(check=Q(check_out__gt=F("check_in")), name="booking_checkout_after_checkin"),
            # DB-level guarantee: one room cannot have two overlapping active bookings.
            # Requires PostgreSQL + BtreeGistExtension() in a migration.
            ExclusionConstraint(
                name="no_overlapping_active_bookings",
                expressions=[
                    ("room", RangeOperators.EQUAL),
                    (DateRange("check_in", "check_out", RangeBoundary()), RangeOperators.OVERLAPS),
                ],
                condition=Q(status__in=["pending", "confirmed"]),
            ),
        ]

    @property
    def nights(self):
        return (self.check_out - self.check_in).days

    def __str__(self):
        return self.reference



""" XXXXXXXXX GUEST MODEL XXXXXXXXX """

class Guest(models.Model):
    """A person staying under a booking. NOT an account. Exactly one primary guest
    per booking carries the contact details used for confirmation emails."""
 
    booking = models.ForeignKey("Booking", on_delete=models.CASCADE, related_name="guests")
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True)   # required for the primary guest (enforce in serializer)
    phone = models.CharField(max_length=32, blank=True)
    is_primary = models.BooleanField(default=False)
 
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["booking"], condition=models.Q(is_primary=True),
                name="one_primary_guest_per_booking",
            ),
        ]
 
    def __str__(self):
        return f"{self.first_name} {self.last_name}"