from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone

from hotels.exceptions import Conflict
from hotels.services import available_rooms

from .models import Booking, Guest
from .notifications import send_confirmation


class RoomUnavailable(Conflict):
    default_detail = "No room of that type is available for those dates."
    default_code = "room_unavailable"


@transaction.atomic
def create_booking(*, customer, room_type, check_in, check_out, adults, children,
                   special_requests="", guests):
    """Server decides price, status, room and hold. The client decides nothing about money."""
    now = timezone.now()
    # Self-healing: release stale unpaid holds on this room type so they can't block the DB constraint.
    Booking.objects.filter(
        status=Booking.Status.PENDING, hold_expires_at__lt=now, room__room_type=room_type
    ).update(status=Booking.Status.EXPIRED)

    nights = (check_out - check_in).days
    candidates = (available_rooms(room_type.hotel, check_in, check_out)
                  .filter(room_type=room_type).order_by("number")[:10])
    for room in candidates:
        try:
            with transaction.atomic():  # savepoint: a lost race must not poison the outer transaction
                booking = Booking.objects.create(
                    customer=customer, room=room, room_type=room_type,
                    check_in=check_in, check_out=check_out, adults=adults, children=children,
                    special_requests=special_requests, status=Booking.Status.PENDING,
                    hold_expires_at=now + timedelta(minutes=getattr(settings, "BOOKING_HOLD_MINUTES", 15)),
                    price_per_night=room_type.base_price,
                    total_amount=room_type.base_price * nights,
                    currency=room_type.hotel.currency,
                )
        except IntegrityError:  # exclusion constraint: someone else took this room a millisecond ago
            continue
        Guest.objects.bulk_create(
            [Guest(booking=booking, is_primary=(i == 0), **g) for i, g in enumerate(guests)])
        return booking
    raise RoomUnavailable()


def can_customer_cancel(booking):
    """PLACEHOLDER POLICY: free cancellation until N hours before check-in. Decide your real one."""
    if booking.status == Booking.Status.PENDING:
        return True
    if booking.status != Booking.Status.CONFIRMED:
        return False
    hotel = booking.room_type.hotel
    start = datetime.combine(booking.check_in, hotel.check_in_time, tzinfo=ZoneInfo(hotel.timezone))
    cutoff = start - timedelta(hours=getattr(settings, "CANCELLATION_CUTOFF_HOURS", 48))
    return timezone.now() < cutoff


@transaction.atomic
def cancel_booking(booking, *, by, reason="", as_staff=False):
    """Returns (booking, refund_review_needed). Refunds are NOT automated - see Payment flow."""
    booking = Booking.objects.select_for_update().select_related("room_type__hotel").get(pk=booking.pk)
    if booking.status not in Booking.ACTIVE_STATUSES:
        raise Conflict(f"Booking is already {booking.status}.")
    if not as_staff and not can_customer_cancel(booking):
        raise Conflict("The free-cancellation window has passed. Please contact the hotel.")
    booking.status = Booking.Status.CANCELLED
    booking.cancelled_at = timezone.now()
    booking.cancelled_by = by
    booking.cancellation_reason = reason[:255]
    booking.save(update_fields=["status", "cancelled_at", "cancelled_by", "cancellation_reason", "updated_at"])
    refund_review = booking.payments.filter(kind="charge", status="succeeded").exists()
    return booking, refund_review


@transaction.atomic
def confirm_booking(booking, *, by):
    """Manual confirmation (cash / bank transfer). Card payments confirm via the webhook."""
    booking = Booking.objects.select_for_update().get(pk=booking.pk)
    if booking.status != Booking.Status.PENDING:
        raise Conflict(f"Only pending bookings can be confirmed (this one is {booking.status}).")
    booking.status = Booking.Status.CONFIRMED
    booking.hold_expires_at = None
    booking.save(update_fields=["status", "hold_expires_at", "updated_at"])
    transaction.on_commit(lambda: send_confirmation(booking.pk))
    return booking