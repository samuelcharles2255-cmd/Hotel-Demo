import logging

from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework.exceptions import APIException, NotFound

from bookings.models import Booking
from bookings.notifications import send_confirmation
from hotels.exceptions import Conflict

from .models import Payment
from .providers import get_provider

log = logging.getLogger(__name__)


class ProviderError(APIException):
    status_code = 502
    default_detail = "Payment provider unavailable. Please try again."


def resolve_booking(request, reference, access_token):
    """Visitor proves ownership with the access token; customer with their login."""
    qs = Booking.objects.filter(reference=reference)
    if access_token:
        qs = qs.filter(access_token=access_token)
    elif request.user.is_authenticated:
        qs = qs.filter(customer=request.user)
    else:
        qs = qs.none()
    booking = qs.first()
    if booking is None:
        raise NotFound("Booking not found.")
    return booking


def _assert_payable(booking):
    if booking.status != Booking.Status.PENDING:
        raise Conflict(f"Booking is {booking.status} and can't be paid.")
    if booking.hold_expires_at and booking.hold_expires_at <= timezone.now():
        raise Conflict("The hold on this booking expired. Please search again.")


def start_checkout(*, booking, method, provider_name, idempotency_key):
    """Amount ALWAYS comes from the booking, never the client. Replays with the same key are safe."""
    provider = get_provider(provider_name)
    payment = Payment.objects.filter(idempotency_key=idempotency_key).first()
    created = False
    if payment is None:
        _assert_payable(booking)
        try:
            with transaction.atomic():
                payment = Payment.objects.create(
                    booking=booking, method=method, provider=provider_name,
                    amount=booking.total_amount, currency=booking.currency,
                    idempotency_key=idempotency_key)
            created = True
        except IntegrityError:  # concurrent request with the same key won the insert
            payment = Payment.objects.get(idempotency_key=idempotency_key)

    if payment.booking_id != booking.id:
        raise Conflict("Idempotency key already used for another booking.")
    if payment.status == Payment.Status.SUCCEEDED:
        raise Conflict("This booking is already paid.")
    if payment.status == Payment.Status.FAILED:
        raise Conflict("That payment attempt failed. Start a new attempt with a new idempotency key.")

    if created:  # network call happens OUTSIDE any DB transaction
        return_url = f"{settings.PAYMENT_RETURN_URL}?ref={booking.reference}"
        try:
            session = provider.create_checkout(payment, return_url)
        except Exception:
            log.exception("create_checkout failed for payment %s", payment.pk)
            payment.status = Payment.Status.FAILED
            payment.failure_reason = "Provider error while creating checkout"
            payment.save(update_fields=["status", "failure_reason"])
            raise ProviderError()
        payment.provider_reference = session.provider_reference
        payment.provider_payload = {"checkout_url": session.checkout_url}
        payment.save(update_fields=["provider_reference", "provider_payload"])
    return payment, payment.provider_payload.get("checkout_url")


@transaction.atomic
def apply_event(provider_name, event):
    """Webhook handler core. Idempotent: providers deliver the same event more than once.
    NOTE: Payment.failure_reason doubles as the 'needs staff attention' note on success."""
    payment = Payment.objects.select_for_update().get(
        provider=provider_name, provider_reference=event.provider_reference)
    if payment.status in (Payment.Status.SUCCEEDED, Payment.Status.REFUNDED):
        return payment
    payment.provider_payload = {**payment.provider_payload, "webhook": event.payload}

    if event.status != "succeeded":
        payment.status = Payment.Status.FAILED
        payment.failure_reason = event.failure_reason[:255]
        payment.save()
        return payment

    if event.amount != payment.amount or event.currency.upper() != payment.currency.upper():
        log.error("Payment %s amount mismatch: expected %s %s, provider says %s %s",
                  payment.pk, payment.amount, payment.currency, event.amount, event.currency)
        payment.status = Payment.Status.FAILED
        payment.failure_reason = (f"Amount mismatch: provider reported {event.amount} {event.currency}. "
                                  "Investigate; money may have moved.")[:255]
        payment.save()
        return payment

    booking = Booking.objects.select_for_update().get(pk=payment.booking_id)
    payment.status = Payment.Status.SUCCEEDED
    payment.paid_at = timezone.now()
    note, confirmed_now = "", False

    if Payment.objects.filter(booking=booking, kind=Payment.Kind.CHARGE,
                              status=Payment.Status.SUCCEEDED).exclude(pk=payment.pk).exists():
        note = "Duplicate payment - refund required."
    elif booking.status in (Booking.Status.PENDING, Booking.Status.EXPIRED):
        try:
            with transaction.atomic():  # EXPIRED -> CONFIRMED is only allowed if the room is still free
                booking.status = Booking.Status.CONFIRMED
                booking.hold_expires_at = None
                booking.save(update_fields=["status", "hold_expires_at", "updated_at"])
            confirmed_now = True
        except IntegrityError:
            note = "Paid after the hold expired and the room was taken - refund required."
    elif booking.status != Booking.Status.CONFIRMED:
        note = f"Paid but booking is {booking.status} - refund required."

    payment.failure_reason = note
    payment.save()
    if note:
        log.warning("Payment %s needs staff attention: %s", payment.pk, note)
    if confirmed_now:
        transaction.on_commit(lambda: send_confirmation(booking.pk))
    return payment