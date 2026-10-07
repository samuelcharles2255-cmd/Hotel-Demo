from datetime import timedelta
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from users.models import User
from .models import Hotel, Room, RoomBlock, RoomType


class HotelApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff_user = User.objects.create_user(
            email="staff@example.com",
            username="staff",
            password="staffpassword123",
            role=User.Role.STAFF,
        )
        self.customer = User.objects.create_user(
            email="guest@example.com",
            username="guest",
            password="guestpassword123",
            role=User.Role.CUSTOMER,
        )

        self.hotel = Hotel.objects.create(
            name="Grand Seaside Hotel",
            slug="grand-seaside",
            address="123 Ocean Drive",
            city="Miami",
            country="USA",
            currency="USD",
        )

        self.room_type = RoomType.objects.create(
            hotel=self.hotel,
            name="Deluxe King",
            base_price=150.00,
            max_adults=2,
            max_children=1,
        )

        self.room1 = Room.objects.create(
            hotel=self.hotel,
            room_type=self.room_type,
            number="101",
            floor=1,
            status=Room.Status.ACTIVE,
        )
        self.room2 = Room.objects.create(
            hotel=self.hotel,
            room_type=self.room_type,
            number="102",
            floor=1,
            status=Room.Status.ACTIVE,
        )

    def test_hotel_list_and_detail(self):
        res = self.client.get(reverse("hotel-list"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data["results"]), 1)

        detail_url = reverse("hotel-detail", kwargs={"slug": self.hotel.slug})
        res = self.client.get(detail_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["name"], "Grand Seaside Hotel")

    def test_room_types_public_read(self):
        res = self.client.get(reverse("room-type-list"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data["results"]), 1)

    def test_hotel_availability(self):
        check_in = (timezone.now() + timedelta(days=2)).date()
        check_out = (timezone.now() + timedelta(days=5)).date()

        url = reverse("hotel-availability", kwargs={"slug": self.hotel.slug})
        res = self.client.get(url, {"check_in": str(check_in), "check_out": str(check_out), "adults": 2})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data["results"]), 1)
        self.assertEqual(res.data["results"][0]["rooms_left"], 2)

    def test_staff_room_management(self):
        # Non-staff cannot view physical rooms
        self.client.force_authenticate(user=self.customer)
        res = self.client.get(reverse("room-list"))
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Staff can view and manage physical rooms
        self.client.force_authenticate(user=self.staff_user)
        res = self.client.get(reverse("room-list"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data["results"]), 2)

