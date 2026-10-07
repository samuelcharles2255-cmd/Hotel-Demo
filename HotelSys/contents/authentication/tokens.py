from django.conf import settings
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

REFRESH_COOKIE = "refresh_token"
COOKIE_PATH = "/api/auth/"  # the browser only sends this cookie to auth endpoints


def set_refresh_cookie(response, refresh_token):
    lifetime = settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]
    response.set_cookie(
        REFRESH_COOKIE, str(refresh_token), max_age=int(lifetime.total_seconds()),
        httponly=True,               # JavaScript (and therefore XSS) cannot read it
        secure=not settings.DEBUG,   # HTTPS only in production
        samesite="Lax", path=COOKIE_PATH,
    )


def clear_refresh_cookie(response):
    response.delete_cookie(REFRESH_COOKIE, path=COOKIE_PATH, samesite="Lax")


def revoke_all_tokens(user):
    """Kill every refresh token the user has (password change/reset, 'log out everywhere')."""
    already = BlacklistedToken.objects.filter(token__user=user).values_list("token_id", flat=True)
    BlacklistedToken.objects.bulk_create(
        [BlacklistedToken(token=t) for t in OutstandingToken.objects.filter(user=user).exclude(id__in=already)],
        ignore_conflicts=True,
    )
