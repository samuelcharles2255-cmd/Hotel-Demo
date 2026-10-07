from datetime import timedelta
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from hotels.models import Hotel, Room, RoomType
from users.models import User
from .models import Booking


class BookingApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff_user = User.objects.create_user(
            email="staff@example.com",
            username="staff",
            password="staffpassword123",
            role=User.Role.STAFF,
        )
        self.customer = User.objects.create_user(
            email="alice@example.com",
            username="alice",
            password="alicepassword123",
            role=User.Role.CUSTOMER,
        )

        self.hotel = Hotel.objects.create(
            name="Palace Hotel",
            slug="palace-hotel",
            address="456 High St",
            city="London",
            country="UK",
            currency="USD",
        )
        self.room_type = RoomType.objects.create(
            hotel=self.hotel,
            name="Superior Double",
            base_price=200.00,
            max_adults=2,
            max_children=1,
        )
        self.room = Room.objects.create(
            hotel=self.hotel,
            room_type=self.room_type,
            number="201",
            status=Room.Status.ACTIVE,
        )

    def test_booking_create_and_lookup(self):
        check_in = (timezone.now() + timedelta(days=3)).date()
        check_out = (timezone.now() + timedelta(days=5)).date()

        create_url = reverse("booking-create")
        payload = {
            "room_type": self.room_type.id,
            "check_in": str(check_in),
            "check_out": str(check_out),
            "adults": 2,
            "children": 0,
            "special_requests": "Quiet room please",
            "guests": [
                {"first_name": "Alice", "last_name": "Smith", "email": "alice@example.com", "phone": "+123456789"}
            ],
        }

        # Anonymous visitor creates a booking
        res = self.client.post(create_url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        reference = res.data["reference"]
        access_token = res.data["access_token"]
        self.assertEqual(res.data["status"], Booking.Status.PENDING)

        # Lookup booking
        lookup_url = reverse("booking-lookup")
        lookup_res = self.client.post(lookup_url, {"reference": reference, "access_token": access_token}, format="json")
        self.assertEqual(lookup_res.status_code, status.HTTP_200_OK)
        self.assertEqual(lookup_res.data["reference"], reference)
        self.assertEqual(lookup_res.data["room_type_name"], "Superior Double")

    def test_staff_booking_list_and_confirm(self):
        check_in = (timezone.now() + timedelta(days=3)).date()
        check_out = (timezone.now() + timedelta(days=5)).date()

        # Customer creates booking
        self.client.force_authenticate(user=self.customer)
        create_url = reverse("booking-create")
        res = self.client.post(
            create_url,
            {
                "room_type": self.room_type.id,
                "check_in": str(check_in),
                "check_out": str(check_out),
                "adults": 1,
                "guests": [{"first_name": "Alice", "last_name": "Customer", "email": "alice@example.com"}],
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        reference = res.data["reference"]

        # Staff confirms booking
        self.client.force_authenticate(user=self.staff_user)
        confirm_url = reverse("staff-booking-confirm", kwargs={"reference": reference})
        confirm_res = self.client.post(confirm_url)
        self.assertEqual(confirm_res.status_code, status.HTTP_200_OK)
        self.assertEqual(confirm_res.data["status"], Booking.Status.CONFIRMED)

