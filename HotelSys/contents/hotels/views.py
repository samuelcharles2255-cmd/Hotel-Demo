from django.db import transaction
from django.db.models import Count, F
from django.db.models.deletion import ProtectedError
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from users.permissions import IsHotelStaff, IsHotelStaffOrReadOnly, is_staff_request

from .exceptions import Conflict
from .models import Hotel, Room, RoomBlock, RoomImage, RoomType
from .serializers import (AvailabilityQuerySerializer, HotelSerializer, RoomBlockSerializer,
                          RoomImageSerializer, RoomSerializer, RoomTypeSerializer)
from .services import available_rooms


class ProtectedDeleteMixin:
    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise Conflict("This record has bookings attached. Deactivate/retire it instead of deleting.")


class HotelViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                   mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """Public read. Staff can edit. Create/delete hotels via Django admin (cascade danger)."""

    serializer_class = HotelSerializer
    permission_classes = [IsHotelStaffOrReadOnly]
    lookup_field = "slug"
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        qs = Hotel.objects.all().order_by("name")
        return qs if is_staff_request(self.request) else qs.filter(is_active=True)

    @action(detail=True, methods=["get"], url_path="availability", permission_classes=[AllowAny])
    def availability(self, request, slug=None):
        hotel = self.get_object()
        q = AvailabilityQuerySerializer(data=request.query_params)
        q.is_valid(raise_exception=True)
        d = q.validated_data
        nights = (d["check_out"] - d["check_in"]).days

        free = available_rooms(hotel, d["check_in"], d["check_out"])
        counts = dict(free.values("room_type_id").annotate(n=Count("id")).values_list("room_type_id", "n"))
        types = (
            hotel.room_types.filter(is_active=True, id__in=counts.keys(), max_adults__gte=d["adults"])
            .annotate(cap=F("max_adults") + F("max_children"))
            .filter(cap__gte=d["adults"] + d["children"])
            .prefetch_related("images")
        )
        results = []
        for rt in types:
            item = dict(RoomTypeSerializer(rt, context={"request": request}).data)
            item.update(rooms_left=counts[rt.id], nights=nights,
                        price_per_night=rt.base_price, total_price=rt.base_price * nights,
                        currency=hotel.currency)
            results.append(item)
        return Response({"check_in": d["check_in"], "check_out": d["check_out"], "results": results})


class RoomTypeViewSet(ProtectedDeleteMixin, viewsets.ModelViewSet):
    """Visitors browse room TYPES (what they buy). Staff manage them and change prices
    with PATCH {"base_price": ...}. Existing bookings keep their snapshot price."""

    serializer_class = RoomTypeSerializer
    permission_classes = [IsHotelStaffOrReadOnly]

    def get_queryset(self):
        qs = RoomType.objects.select_related("hotel").prefetch_related("images").order_by("id")
        if not is_staff_request(self.request):
            qs = qs.filter(is_active=True, hotel__is_active=True)
        slug = self.request.query_params.get("hotel")
        return qs.filter(hotel__slug=slug) if slug else qs


class RoomViewSet(ProtectedDeleteMixin, viewsets.ModelViewSet):
    """Physical rooms: staff only. Visitors never see room numbers."""

    serializer_class = RoomSerializer
    permission_classes = [IsHotelStaff]

    def get_queryset(self):
        qs = Room.objects.select_related("room_type", "hotel").order_by("hotel_id", "number")
        p = self.request.query_params
        for key in ("hotel", "room_type", "status"):
            if p.get(key):
                qs = qs.filter(**{key: p[key]})
        return qs


class RoomImageViewSet(viewsets.ModelViewSet):
    serializer_class = RoomImageSerializer
    permission_classes = [IsHotelStaffOrReadOnly]

    def get_queryset(self):
        qs = RoomImage.objects.all()
        if self.request.query_params.get("room_type"):
            qs = qs.filter(room_type=self.request.query_params["room_type"])
        return qs

    def _save(self, serializer):
        with transaction.atomic():
            if serializer.validated_data.get("is_primary"):
                room_type = serializer.validated_data.get("room_type") or serializer.instance.room_type
                RoomImage.objects.filter(room_type=room_type, is_primary=True).exclude(
                    pk=getattr(serializer.instance, "pk", None)).update(is_primary=False)
            serializer.save()

    perform_create = _save
    perform_update = _save


class RoomBlockViewSet(viewsets.ModelViewSet):
    """Staff: block a room for a date range (repairs etc.)."""

    serializer_class = RoomBlockSerializer
    permission_classes = [IsHotelStaff]

    def get_queryset(self):
        qs = RoomBlock.objects.select_related("room").order_by("-start_date")
        if self.request.query_params.get("room"):
            qs = qs.filter(room=self.request.query_params["room"])
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)