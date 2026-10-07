import logging
from django.conf import settings
from django.core.mail import send_mail

from .models import Booking

logger = logging.getLogger(__name__)


def send_confirmation(booking_id):
    """Sends a booking confirmation email to the primary guest / customer."""
    try:
        booking = Booking.objects.select_related("room_type__hotel", "customer").prefetch_related("guests").get(pk=booking_id)
    except Booking.DoesNotExist:
        logger.warning("Attempted to send confirmation for non-existent booking ID %s", booking_id)
        return False

    primary_guest = booking.guests.filter(is_primary=True).first()
    recipient_email = (primary_guest.email if primary_guest and primary_guest.email else None) or (
        booking.customer.email if booking.customer else None
    )

    if not recipient_email:
        logger.info("No email found for booking %s; skipping email delivery.", booking.reference)
        return False

    hotel_name = getattr(booking.room_type.hotel, "name", "Our Hotel")
    subject = f"Booking Confirmation - {booking.reference} ({hotel_name})"
    message = (
        f"Dear {primary_guest.first_name if primary_guest else 'Guest'},\n\n"
        f"Your reservation at {hotel_name} is confirmed!\n"
        f"Booking Reference: {booking.reference}\n"
        f"Check-in: {booking.check_in}\n"
        f"Check-out: {booking.check_out}\n"
        f"Room Type: {booking.room_type.name}\n"
        f"Total Amount: {booking.currency} {booking.total_amount}\n\n"
        f"Access Token: {booking.access_token}\n\n"
        f"Thank you for choosing {hotel_name}!"
    )

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@hotel.example"),
            recipient_list=[recipient_email],
            fail_silently=True,
        )
        logger.info("Confirmation email sent to %s for booking %s", recipient_email, booking.reference)
        return True
    except Exception as exc:
        logger.error("Failed to send booking confirmation email: %s", exc)
        return False

