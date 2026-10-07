def claim_guest_bookings(user):
    """Attach earlier visitor bookings to this account. ONLY call for a VERIFIED email,
    otherwise anyone could register someone else's email and read their bookings."""
    from bookings.models import Booking  # local import: avoids a users <-> bookings import cycle

    ids = list(Booking.objects.filter(
        customer__isnull=True, guests__is_primary=True, guests__email__iexact=user.email,
    ).values_list("id", flat=True))
    return Booking.objects.filter(id__in=ids).update(customer=user)
