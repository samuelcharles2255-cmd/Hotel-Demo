from django.utils import timezone
from rest_framework import serializers

from .models import Hotel, Room, RoomBlock, RoomImage, RoomType


class AvailabilityQuerySerializer(serializers.Serializer):
    check_in = serializers.DateField()
    check_out = serializers.DateField()
    adults = serializers.IntegerField(default=1, min_value=1)
    children = serializers.IntegerField(default=0, min_value=0)

    def validate(self, attrs):
        check_in = attrs["check_in"]
        check_out = attrs["check_out"]
        today = timezone.now().date()

        if check_in < today:
            raise serializers.ValidationError({"check_in": "Check-in date cannot be in the past."})
        if check_out <= check_in:
            raise serializers.ValidationError({"check_out": "Check-out date must be after check-in date."})
        return attrs


class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "address",
            "city",
            "country",
            "phone",
            "email",
            "check_in_time",
            "check_out_time",
            "currency",
            "timezone",
            "is_active",
            "created_at",
        )
        read_only_fields = ("id", "created_at")


class RoomImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomImage
        fields = ("id", "room_type", "image", "alt_text", "is_primary", "sort_order", "uploaded_at")
        read_only_fields = ("id", "uploaded_at")


class RoomTypeSerializer(serializers.ModelSerializer):
    images = RoomImageSerializer(many=True, read_only=True)
    max_guests = serializers.IntegerField(read_only=True)

    class Meta:
        model = RoomType
        fields = (
            "id",
            "hotel",
            "name",
            "description",
            "base_price",
            "max_adults",
            "max_children",
            "max_guests",
            "bed_configuration",
            "amenities",
            "is_active",
            "images",
        )
        read_only_fields = ("id", "max_guests")


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ("id", "hotel", "room_type", "number", "floor", "status", "notes")
        read_only_fields = ("id",)


class RoomBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomBlock
        fields = ("id", "room", "start_date", "end_date", "reason", "created_by", "created_at")
        read_only_fields = ("id", "created_by", "created_at")

    def validate(self, attrs):
        start_date = attrs.get("start_date") or getattr(self.instance, "start_date", None)
        end_date = attrs.get("end_date") or getattr(self.instance, "end_date", None)
        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError({"end_date": "End date must be strictly after start date."})
        return attrs

