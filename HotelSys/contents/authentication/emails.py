import logging

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core import signing
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

log = logging.getLogger(__name__)

VERIFY_SALT = "email-verify"
VERIFY_MAX_AGE = 48 * 3600


def make_verification_token(user):
    # Bound to the email address: if the email ever changes, old links stop working.
    return signing.dumps({"uid": user.pk, "email": user.email}, salt=VERIFY_SALT)


def read_verification_token(token):
    """Raises signing.BadSignature (incl. SignatureExpired) on any problem."""
    return signing.loads(token, salt=VERIFY_SALT, max_age=VERIFY_MAX_AGE)


def _send(to, subject, body):
    try:
        send_mail(subject, body, None, [to])
    except Exception:
        log.exception("Failed to send '%s' email", subject)


def send_verification_email(user):
    link = f"{settings.SITE_URL}/verify-email?token={make_verification_token(user)}"
    _send(user.email, "Verify your email",
          f"Hi {user.first_name},\n\nConfirm your email to finish setting up your account:\n{link}\n\n"
          "This link expires in 48 hours. If you didn't sign up, ignore this email.")


def send_password_reset_email(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)  # single-use: dies when the password changes
    link = f"{settings.SITE_URL}/reset-password?uid={uid}&token={token}"
    _send(user.email, "Reset your password",
          f"Use this link to choose a new password:\n{link}\n\n"
          "It expires in 1 hour. If you didn't ask for this, ignore this email - your password is unchanged.")


def send_account_exists_email(user):
    # Registration never reveals whether an email is taken; the owner is told by email instead.
    _send(user.email, "Someone tried to register with your email",
          f"An account already exists for this address. If it was you, log in or reset your password:\n"
          f"{settings.SITE_URL}/forgot-password\n\nIf it wasn't you, no action is needed.")
