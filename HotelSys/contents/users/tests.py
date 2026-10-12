from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import User


class UserApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff_user = User.objects.create_user(
            email="staff@example.com",
            username="staff",
            password="staffpassword123",
            role=User.Role.STAFF,
        )
        self.customer_user = User.objects.create_user(
            email="customer@example.com",
            username="customer",
            password="customerpassword123",
            role=User.Role.CUSTOMER,
            first_name="Jane",
            last_name="Doe",
            phone="+123456789",
        )

    def test_register_customer(self):
        url = reverse("user-register")
        data = {
            "email": "newguest@example.com",
            "password": "StrongPassword123!",
            "first_name": "New",
            "last_name": "Guest",
            "phone": "+987654321",
        }
        res = self.client.post(url, data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["email"], "newguest@example.com")
        self.assertTrue(User.objects.filter(email="newguest@example.com").exists())

    def test_login_and_token_refresh(self):
        login_url = reverse("user-login")
        res = self.client.post(login_url, {"email": "customer@example.com", "password": "customerpassword123"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)

        refresh_url = reverse("user-token-refresh")
        refresh_res = self.client.post(refresh_url, {"refresh": res.data["refresh"]})
        self.assertEqual(refresh_res.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_res.data)

    def test_me_view(self):
        me_url = reverse("user-me")
        # Unauthorized
        res = self.client.get(me_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        # Authorized
        self.client.force_authenticate(user=self.customer_user)
        res = self.client.get(me_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["email"], "customer@example.com")

        # Update profile
        patch_res = self.client.patch(me_url, {"phone": "+1122334455"})
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.customer_user.refresh_from_db()
        self.assertEqual(self.customer_user.phone, "+1122334455")

    def test_staff_customer_viewset(self):
        customers_url = reverse("user-customer-list")

        # Customer forbidden
        self.client.force_authenticate(user=self.customer_user)
        res = self.client.get(customers_url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Staff allowed
        self.client.force_authenticate(user=self.staff_user)
        res = self.client.get(customers_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data["results"]), 1)

