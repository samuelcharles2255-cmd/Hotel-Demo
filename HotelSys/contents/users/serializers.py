from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "phone",
            "role",
            "is_hotel_staff",
            "date_joined",
        )
        read_only_fields = ("id", "role", "is_hotel_staff", "date_joined")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("id", "email", "username", "password", "first_name", "last_name", "phone")
        read_only_fields = ("id",)

    def validate(self, attrs):
        if not attrs.get("username"):
            # If username is omitted, use email as username
            attrs["username"] = attrs["email"]
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(
            role=User.Role.CUSTOMER,
            **validated_data
        )
        user.set_password(password)
        user.save()
        return user


class CustomerAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "phone",
            "is_active",
            "date_joined",
        )
        read_only_fields = ("id", "email", "username", "date_joined")

