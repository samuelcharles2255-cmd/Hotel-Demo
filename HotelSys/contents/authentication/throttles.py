import hashlib

from rest_framework.throttling import SimpleRateThrottle


class EmailKeyedThrottle(SimpleRateThrottle):
    """Limits by the email in the request body, regardless of IP and of whether the account exists
    (so it can't be used to probe which emails are registered)."""

    def get_cache_key(self, request, view):
        email = str(request.data.get("email", "")).strip().lower()
        if not email:
            return None
        ident = hashlib.sha256(email.encode()).hexdigest()
        return self.cache_format % {"scope": self.scope, "ident": ident}


class LoginEmailThrottle(EmailKeyedThrottle):
    scope = "login_email"


class ResetEmailThrottle(EmailKeyedThrottle):
    scope = "reset_email"  # stops someone mail-bombing a victim with reset emails
