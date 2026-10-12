from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import CustomerViewSet, LoginView, MeView, RegisterView

router = DefaultRouter()
router.register(r"customers", CustomerViewSet, basename="user-customer")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="user-register"),
    path("login/", LoginView.as_view(), name="user-login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="user-token-refresh"),
    path("me/", MeView.as_view(), name="user-me"),
    path("", include(router.urls)),
]

