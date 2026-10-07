from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from users.models import User


def check_new_password(password, user, field="password"):
    try:
        validate_password(password, user)
    except DjangoValidationError as exc:
        raise serializers.ValidationError({field: list(exc.messages)})


class RegisterSerializer(serializers.Serializer):
    # role / is_staff / is_active / email_verified are deliberately NOT accepted from clients.
    email = serializers.EmailField(max_length=254)
    password = serializers.CharField(write_only=True, max_length=128)  # cap length: hashing is expensive
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True, default="")

    def validate_email(self, value):
        return value.strip().lower()

    def validate(self, attrs):
        check_new_password(attrs["password"], User(
            email=attrs["email"], first_name=attrs["first_name"], last_name=attrs["last_name"]))
        return attrs


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        attrs[self.username_field] = str(attrs[self.username_field]).strip().lower()
        return super().validate(attrs)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "phone", "role", "email_verified")
        read_only_fields = ("id", "email", "role", "email_verified")


class CustomerAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "phone", "is_active", "email_verified", "date_joined")
        read_only_fields = ("id", "email", "first_name", "last_name", "phone", "email_verified", "date_joined")


class VerifyEmailSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=512)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)

    def validate_email(self, value):
        return value.strip().lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(max_length=64)
    token = serializers.CharField(max_length=128)
    password = serializers.CharField(max_length=128)


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(max_length=128)
    new_password = serializers.CharField(max_length=128)
