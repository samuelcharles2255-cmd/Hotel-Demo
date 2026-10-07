from django.utils import timezone
from rest_framework import serializers

from hotels.models import RoomType
from .models import Booking, Guest


class GuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guest
        fields = ("id", "first_name", "last_name", "email", "phone", "is_primary")
        read_only_fields = ("id",)


class GuestInputSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField(required=False, allow_blank=True, default="")
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True, default="")


class BookingCreateSerializer(serializers.Serializer):
    room_type = serializers.PrimaryKeyRelatedField(
        queryset=RoomType.objects.filter(is_active=True, hotel__is_active=True)
    )
    check_in = serializers.DateField()
    check_out = serializers.DateField()
    adults = serializers.IntegerField(min_value=1, default=1)
    children = serializers.IntegerField(min_value=0, default=0)
    special_requests = serializers.CharField(required=False, allow_blank=True, default="")
    guests = GuestInputSerializer(many=True)

    def validate(self, attrs):
        check_in = attrs["check_in"]
        check_out = attrs["check_out"]
        today = timezone.now().date()
        if check_in < today:
            raise serializers.ValidationError({"check_in": "Check-in date cannot be in the past."})
        if check_out <= check_in:
            raise serializers.ValidationError({"check_out": "Check-out date must be after check-in date."})

        guests = attrs.get("guests", [])
        if not guests:
            raise serializers.ValidationError({"guests": "At least one guest is required."})

        # Primary guest (first guest) must provide an email
        if not guests[0].get("email"):
            raise serializers.ValidationError(
                {"guests": "The primary guest (first in list) must provide an email address."}
            )

        room_type = attrs["room_type"]
        adults = attrs.get("adults", 1)
        children = attrs.get("children", 0)
        if adults > room_type.max_adults:
            raise serializers.ValidationError(
                {"adults": f"Adults exceed capacity (max {room_type.max_adults})."}
            )
        if adults + children > room_type.max_guests:
            raise serializers.ValidationError(
                {"guests": f"Total guests exceed room capacity (max {room_type.max_guests})."}
            )

        return attrs


class BookingCreatedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = (
            "reference",
            "access_token",
            "status",
            "check_in",
            "check_out",
            "nights",
            "adults",
            "children",
            "price_per_night",
            "total_amount",
            "currency",
            "hold_expires_at",
            "created_at",
        )


class LookupSerializer(serializers.Serializer):
    reference = serializers.CharField(max_length=16)
    access_token = serializers.UUIDField()


class BookingSerializer(serializers.ModelSerializer):
    guests = GuestSerializer(many=True, read_only=True)
    hotel_name = serializers.CharField(source="room_type.hotel.name", read_only=True)
    room_type_name = serializers.CharField(source="room_type.name", read_only=True)

    class Meta:
        model = Booking
        fields = (
            "reference",
            "status",
            "hotel_name",
            "room_type_name",
            "check_in",
            "check_out",
            "nights",
            "adults",
            "children",
            "special_requests",
            "price_per_night",
            "total_amount",
            "currency",
            "hold_expires_at",
            "guests",
            "created_at",
            "cancelled_at",
            "cancellation_reason",
        )


class StaffBookingSerializer(serializers.ModelSerializer):
    guests = GuestSerializer(many=True, read_only=True)
    room_number = serializers.CharField(source="room.number", read_only=True)
    room_type_name = serializers.CharField(source="room_type.name", read_only=True)
    hotel_name = serializers.CharField(source="room_type.hotel.name", read_only=True)
    customer_email = serializers.EmailField(source="customer.email", read_only=True)

    class Meta:
        model = Booking
        fields = (
            "id",
            "reference",
            "access_token",
            "customer",
            "customer_email",
            "hotel_name",
            "room",
            "room_number",
            "room_type",
            "room_type_name",
            "check_in",
            "check_out",
            "nights",
            "adults",
            "children",
            "special_requests",
            "status",
            "hold_expires_at",
            "price_per_night",
            "total_amount",
            "currency",
            "cancelled_at",
            "cancelled_by",
            "cancellation_reason",
            "guests",
            "created_at",
            "updated_at",
        )


class CancelSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, default="")

