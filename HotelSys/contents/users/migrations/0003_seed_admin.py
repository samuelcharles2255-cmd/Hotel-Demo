from django.db import migrations
from django.contrib.auth.hashers import make_password


def seed_admin_user(apps, schema_editor):
    User = apps.get_model("users", "User")
    admin_email = "samuel.charles2255@gmail.com"
    if not User.objects.filter(email=admin_email).exists():
        User.objects.create(
            email=admin_email,
            username="samuel",
            password=make_password("Admin12345!"),
            role="admin",
            is_staff=True,
            is_superuser=True,
            email_verified=True,
            first_name="Samuel",
            last_name="Charles",
        )


def unseed_admin_user(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_alter_user_options_user_email_verified_and_more"),
    ]

    operations = [
        migrations.RunPython(seed_admin_user, unseed_admin_user),
    ]
