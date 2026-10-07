from bookings.models import Booking
from .models import Room, RoomBlock


def available_rooms(hotel, check_in, check_out):
    """Returns a QuerySet of physical Room objects in the given hotel

    that are active and free from overlapping room blocks and active bookings
    for the interval [check_in, check_out).
    """
    blocked_room_ids = RoomBlock.objects.filter(
        room__hotel=hotel,
        start_date__lt=check_out,
        end_date__gt=check_in,
    ).values_list("room_id", flat=True)

    booked_room_ids = Booking.objects.filter(
        room__hotel=hotel,
        status__in=Booking.ACTIVE_STATUSES,
        check_in__lt=check_out,
        check_out__gt=check_in,
    ).values_list("room_id", flat=True)

    return (
        Room.objects.filter(
            hotel=hotel,
            status=Room.Status.ACTIVE,
        )
        .exclude(id__in=blocked_room_ids)
        .exclude(id__in=booked_room_ids)
    )

