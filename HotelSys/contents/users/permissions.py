from rest_framework.permissions import BasePermission, SAFE_METHODS


def is_staff_request(request):
    user = getattr(request, "user", None)
    return bool(user and user.is_authenticated and (getattr(user, "is_hotel_staff", False) or user.is_staff))


class IsHotelStaff(BasePermission):
    """Allows access only to authenticated staff/admin users."""

    def has_permission(self, request, view):
        return is_staff_request(request)


class IsHotelStaffOrReadOnly(BasePermission):
    """Allows safe methods to anyone, and write methods only to staff/admin."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return is_staff_request(request)

