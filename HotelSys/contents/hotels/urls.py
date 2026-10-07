from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    HotelViewSet,
    RoomBlockViewSet,
    RoomImageViewSet,
    RoomTypeViewSet,
    RoomViewSet,
)

router = DefaultRouter()
router.register(r"room-types", RoomTypeViewSet, basename="room-type")
router.register(r"rooms", RoomViewSet, basename="room")
router.register(r"room-images", RoomImageViewSet, basename="room-image")
router.register(r"room-blocks", RoomBlockViewSet, basename="room-block")
router.register(r"", HotelViewSet, basename="hotel")

urlpatterns = [
    path("", include(router.urls)),
]

