from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings


class Hotel(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=300)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    check_in_time = models.TimeField(default="14:00")
    check_out_time = models.TimeField(default="11:00")
    currency = models.CharField(max_length=3, default="USD")  # ISO 4217
    timezone = models.CharField(max_length=64, default="UTC")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


"""  XXXXXXX ROOM MODEL XXXXXXXXXX """

class Room(models.Model):
    """A physical, numbered room. Permanent state only (active/maintenance/retired).
    Date-based blocking is RoomBlock, NOT a boolean here."""
 
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        MAINTENANCE = "maintenance", "Under maintenance"
        RETIRED = "retired", "Retired"
 
    hotel = models.ForeignKey("Hotel", on_delete=models.CASCADE, related_name="rooms")
    room_type = models.ForeignKey("RoomType", on_delete=models.PROTECT, related_name="rooms")
    number = models.CharField(max_length=20)
    floor = models.SmallIntegerField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    notes = models.TextField(blank=True)
 
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["hotel", "number"], name="uniq_room_number_per_hotel"),
        ]
 
    def clean(self):
        if self.room_type_id and self.hotel_id and self.room_type.hotel_id != self.hotel_id:
            raise ValidationError("Room type belongs to a different hotel.")
 
    def __str__(self):
        return f"Room {self.number}"



    


""" XXXXXXX ROOMTYPE  MODEL XXXXXXXXX """

class RoomType(models.Model):
    """The thing guests actually shop for (Deluxe, Suite...). Price lives HERE."""

    hotel = models.ForeignKey("Hotel", on_delete=models.CASCADE, related_name="room_types")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)  # per night
    max_adults = models.PositiveSmallIntegerField(default=2)
    max_children = models.PositiveSmallIntegerField(default=0)
    bed_configuration = models.CharField(max_length=100, blank=True)
    amenities = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["hotel", "name"], name="uniq_roomtype_name_per_hotel"),
            models.CheckConstraint(check=models.Q(base_price__gte=0), name="roomtype_price_non_negative"),
        ]

    @property
    def max_guests(self):
        return self.max_adults + self.max_children

    def __str__(self):
        return f"{self.name} ({self.hotel})"


"""  XXXXXXX ROOM BLOCKS XXXXXX """
class RoomBlock(models.Model):
    """Staff blocks a room for a date range (repairs, owner use, etc.).
    Availability = no overlapping active Booking AND no overlapping RoomBlock."""
 
    room = models.ForeignKey("Room", on_delete=models.CASCADE, related_name="blocks")
    start_date = models.DateField()
    end_date = models.DateField()  # exclusive, same convention as check_out
    reason = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(end_date__gt=models.F("start_date")), name="block_end_after_start"),
        ]



""" XXXXXXX ROOM IMAGE XXXXXX """
class RoomImage(models.Model):
    room_type = models.ForeignKey("RoomType", on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="room_images/%Y/%m/")
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    sort_order = models.PositiveSmallIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        ordering = ["sort_order", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["room_type"], condition=models.Q(is_primary=True),
                name="one_primary_image_per_roomtype",
            ),
        ]

    

    