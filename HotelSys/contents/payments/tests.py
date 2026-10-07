import uuid
from datetime import timedelta
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from bookings.models import Booking, Guest
from hotels.models import Hotel, Room, RoomType
from users.models import User
from .models import Payment


class PaymentApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff_user = User.objects.create_user(
            email="staff@example.com",
            username="staff",
            password="staffpassword123",
            role=User.Role.STAFF,
        )
        self.hotel = Hotel.objects.create(
            name="Resort & Spa",
            slug="resort-spa",
            address="789 Palm Way",
            city="Honolulu",
            country="USA",
            currency="USD",
        )
        self.room_type = RoomType.objects.create(
            hotel=self.hotel,
            name="Ocean Suite",
            base_price=300.00,
            max_adults=2,
            max_children=1,
        )
        self.room = Room.objects.create(
            hotel=self.hotel,
            room_type=self.room_type,
            number="301",
            status=Room.Status.ACTIVE,
        )

        check_in = (timezone.now() + timedelta(days=2)).date()
        check_out = (timezone.now() + timedelta(days=4)).date()
        self.booking = Booking.objects.create(
            room=self.room,
            room_type=self.room_type,
            check_in=check_in,
            check_out=check_out,
            adults=2,
            status=Booking.Status.PENDING,
            hold_expires_at=timezone.now() + timedelta(minutes=15),
            price_per_night=300.00,
            total_amount=600.00,
            currency="USD",
        )
        Guest.objects.create(
            booking=self.booking,
            first_name="Bob",
            last_name="Marley",
            email="bob@example.com",
            is_primary=True,
        )

    def test_start_checkout_and_webhook_confirmation(self):
        checkout_url = reverse("payment-checkout")
        idempotency_key = str(uuid.uuid4())
        checkout_data = {
            "booking_reference": self.booking.reference,
            "access_token": str(self.booking.access_token),
            "method": Payment.Method.CARD,
            "provider": "dummy",
            "idempotency_key": idempotency_key,
        }

        # 1. Start checkout
        res = self.client.post(checkout_url, checkout_data, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("checkout_url", res.data)
        payment_id = res.data["payment_id"]

        payment = Payment.objects.get(pk=payment_id)
        self.assertEqual(payment.status, Payment.Status.PENDING)
        self.assertTrue(payment.provider_reference)

        # 2. Webhook confirms payment
        webhook_url = reverse("payment-webhook", kwargs={"provider": "dummy"})
        webhook_data = {
            "provider_reference": payment.provider_reference,
            "status": "succeeded",
            "amount": "600.00",
            "currency": "USD",
        }
        wb_res = self.client.post(webhook_url, webhook_data, format="json")
        self.assertEqual(wb_res.status_code, status.HTTP_200_OK)

        # Verify payment & booking are now confirmed
        payment.refresh_from_db()
        self.assertEqual(payment.status, Payment.Status.SUCCEEDED)

        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.Status.CONFIRMED)

    def test_staff_payment_viewset(self):
        Payment.objects.create(
            booking=self.booking,
            method=Payment.Method.CARD,
            provider="dummy",
            provider_reference="dummy_ref_123",
            amount=600.00,
            currency="USD",
        )
        staff_url = reverse("staff-payment-list")

        # Anonymous / unauthenticated forbidden
        res = self.client.get(staff_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        # Staff authenticated
        self.client.force_authenticate(user=self.staff_user)
        res = self.client.get(staff_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data["results"]), 1)

