from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BookingCreateView,
    BookingLookupView,
    MyBookingViewSet,
    StaffBookingViewSet,
)

router = DefaultRouter()
router.register(r"my", MyBookingViewSet, basename="my-booking")
router.register(r"staff", StaffBookingViewSet, basename="staff-booking")

urlpatterns = [
    path("create/", BookingCreateView.as_view(), name="booking-create"),
    path("lookup/", BookingLookupView.as_view(), name="booking-lookup"),
    path("", include(router.urls)),
]

