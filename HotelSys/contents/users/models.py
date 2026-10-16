from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.functions import Lower


class User(AbstractUser):
    """Customers and staff/admin only. Visitors have NO User row (guest checkout).

    Set AUTH_USER_MODEL = "hotel.User" BEFORE your first migration.
    """
    email_verified = models.BooleanField(default=False)

    class Meta:
        app_label = "users"
        constraints = [models.UniqueConstraint(Lower("email"), name="uniq_user_email_ci")]

    def save(self, *args, **kwargs):
        self.email = self.email.strip().lower()
        if self.is_superuser:                # createsuperuser would otherwise give role=customer,
            self.role = self.Role.ADMIN      # and my API permissions check role, not is_superuser
            self.email_verified = True
        super().save(*args, **kwargs)

    class Role(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        STAFF = "staff", "Hotel staff"
        ADMIN = "admin", "Admin"

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=32, blank=True)
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.CUSTOMER)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    @property
    def is_hotel_staff(self):
        return self.role in (self.Role.STAFF, self.Role.ADMIN)

    def __str__(self):
        return self.email