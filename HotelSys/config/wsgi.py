"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_wsgi_application()

# Automatically apply migrations and seed data on cloud startup (Render/Railway/etc.)
# so manual shell access or paid tiers are never required.
if os.environ.get("RENDER") or os.environ.get("AUTO_MIGRATE"):
    import sys
    try:
        from django.core.management import call_command
        call_command("migrate", interactive=False)
        print("Auto-migration completed successfully.")
    except Exception as exc:
        print(f"Auto-migration notice: {exc}", file=sys.stderr)

    try:
        from hotels.models import Hotel
        if not Hotel.objects.filter(slug="aether-luxury-hotel").exists():
            import seed_hotel
            seed_hotel.seed()
            print("Auto-seed completed successfully.")
    except Exception as exc:
        print(f"Auto-seed notice: {exc}", file=sys.stderr)
