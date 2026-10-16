from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q


class EmailOrUsernameModelBackend(ModelBackend):
    """
    Allows authentication with either email address or username.
    This ensures Django Admin and API logins succeed whether the user enters
    their username (e.g. 'samuel') or their email address (e.g. 'samuel.charles2255@gmail.com').
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        if username is None:
            username = kwargs.get(UserModel.USERNAME_FIELD) or kwargs.get("email")

        if not username or not password:
            return None

        login_identifier = str(username).strip()
        try:
            user = UserModel.objects.filter(
                Q(username__iexact=login_identifier) | Q(email__iexact=login_identifier)
            ).first()
        except Exception:
            return None

        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
