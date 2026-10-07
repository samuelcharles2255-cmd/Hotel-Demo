from django.contrib import admin

from .models import Hotel, Room, RoomBlock, RoomImage, RoomType


class RoomInline(admin.TabularInline):
    model = Room
    extra = 1


class RoomImageInline(admin.TabularInline):
    model = RoomImage
    extra = 1


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "country", "currency", "is_active", "created_at")
    list_filter = ("is_active", "country")
    search_fields = ("name", "city", "country", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(RoomType)
class RoomTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "hotel", "base_price", "max_adults", "max_children", "is_active")
    list_filter = ("hotel", "is_active")
    search_fields = ("name", "hotel__name")
    inlines = [RoomImageInline]


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("number", "hotel", "room_type", "floor", "status")
    list_filter = ("hotel", "status", "room_type")
    search_fields = ("number", "hotel__name")


@admin.register(RoomBlock)
class RoomBlockAdmin(admin.ModelAdmin):
    list_display = ("room", "start_date", "end_date", "reason", "created_by", "created_at")
    list_filter = ("room__hotel", "start_date")
    search_fields = ("room__number", "reason")


@admin.register(RoomImage)
class RoomImageAdmin(admin.ModelAdmin):
    list_display = ("room_type", "is_primary", "sort_order", "uploaded_at")
    list_filter = ("room_type__hotel", "is_primary")

