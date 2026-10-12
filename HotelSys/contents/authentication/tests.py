from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from users.models import User
from .emails import make_verification_token
from .tokens import REFRESH_COOKIE


class AuthenticationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="testuser@example.com",
            username="testuser",
            password="StrongPassword123!",
            role=User.Role.CUSTOMER,
            first_name="Test",
            last_name="User",
            email_verified=True,
        )

    def test_register_flow(self):
        url = reverse("register")
        payload = {
            "email": "freshsignup@example.com",
            "password": "StrongPassword123!",
            "first_name": "Fresh",
            "last_name": "User",
            "phone": "+123456789",
        }
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_202_ACCEPTED)
        self.assertTrue(User.objects.filter(email="freshsignup@example.com").exists())

    def test_verify_email(self):
        unverified_user = User.objects.create_user(
            email="unverified@example.com",
            username="unverified",
            password="StrongPassword123!",
            role=User.Role.CUSTOMER,
            first_name="Unverified",
            last_name="User",
            email_verified=False,
        )
        token = make_verification_token(unverified_user)
        url = reverse("verify-email")
        res = self.client.post(url, {"token": token}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        unverified_user.refresh_from_db()
        self.assertTrue(unverified_user.email_verified)

    def test_login_and_logout(self):
        login_url = reverse("login")
        res = self.client.post(
            login_url,
            {"email": "testuser@example.com", "password": "StrongPassword123!"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertIn(REFRESH_COOKIE, res.cookies)

        refresh_token = res.cookies[REFRESH_COOKIE].value
        # Refresh token endpoint
        refresh_url = reverse("token-refresh")
        self.client.cookies[REFRESH_COOKIE] = refresh_token
        refresh_res = self.client.post(refresh_url, {"refresh": refresh_token}, format="json")
        self.assertEqual(refresh_res.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_res.data)

        # Logout endpoint
        logout_url = reverse("logout")
        logout_res = self.client.post(logout_url, format="json")
        self.assertEqual(logout_res.status_code, status.HTTP_204_NO_CONTENT)

    def test_me_endpoint(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get(reverse("me"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["email"], "testuser@example.com")

    def test_refresh_invalid_token_clears_cookie(self):
        refresh_url = reverse("token-refresh")
        self.client.cookies[REFRESH_COOKIE] = "invalid_token_xyz"
        res = self.client.post(refresh_url, {"refresh": "invalid_token_xyz"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn(REFRESH_COOKIE, res.cookies)
        self.assertEqual(res.cookies[REFRESH_COOKIE].value, "")

    def test_refresh_rotates_cookie_without_leaking_in_body(self):
        login_url = reverse("login")
        login_res = self.client.post(
            login_url,
            {"email": "testuser@example.com", "password": "StrongPassword123!"},
            format="json",
        )
        refresh_token = login_res.cookies[REFRESH_COOKIE].value

        refresh_url = reverse("token-refresh")
        self.client.cookies[REFRESH_COOKIE] = refresh_token
        res = self.client.post(refresh_url, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertNotIn("refresh", res.data)
        self.assertIn(REFRESH_COOKIE, res.cookies)


