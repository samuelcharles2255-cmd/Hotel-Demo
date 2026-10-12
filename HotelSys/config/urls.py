from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request):
    return Response(
        {
            "status": "online",
            "message": "Hotel Reservation System API",
            "endpoints": {
                "admin": "/admin/",
                "auth": "/api/auth/",
                "users": "/api/users/",
                "hotels": "/api/hotels/",
                "bookings": "/api/bookings/",
                "payments": "/api/payments/",
            },
        }
    )


urlpatterns = [
    path("", api_root, name="api-root"),
    path("admin/", admin.site.urls),
    path("api/", include("authentication.urls")),
    path("api/users/", include("users.urls")),
    path("api/hotels/", include("hotels.urls")),
    path("api/bookings/", include("bookings.urls")),
    path("api/payments/", include("payments.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
