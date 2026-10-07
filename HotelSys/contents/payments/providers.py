import importlib
import logging
import uuid
from decimal import Decimal
from django.conf import settings
from django.utils.module_loading import import_string

logger = logging.getLogger(__name__)


class UnknownProvider(Exception):
    pass


class InvalidWebhook(Exception):
    pass


class CheckoutSession:
    def __init__(self, provider_reference: str, checkout_url: str):
        self.provider_reference = provider_reference
        self.checkout_url = checkout_url


class WebhookEvent:
    def __init__(
        self,
        provider_reference: str,
        status: str,
        amount: Decimal,
        currency: str,
        payload: dict,
        failure_reason: str = "",
    ):
        self.provider_reference = provider_reference
        self.status = status
        self.amount = Decimal(str(amount))
        self.currency = currency.upper()
        self.payload = payload
        self.failure_reason = failure_reason


class BasePaymentProvider:
    def create_checkout(self, payment, return_url: str) -> CheckoutSession:
        raise NotImplementedError

    def parse_webhook(self, request) -> WebhookEvent:
        raise NotImplementedError


class DummyProvider(BasePaymentProvider):
    """A mock provider for testing and local development."""

    def create_checkout(self, payment, return_url: str) -> CheckoutSession:
        provider_ref = f"dummy_{uuid.uuid4().hex[:16]}"
        separator = "&" if "?" in return_url else "?"
        checkout_url = f"{return_url}{separator}provider_ref={provider_ref}&status=succeeded"
        return CheckoutSession(provider_reference=provider_ref, checkout_url=checkout_url)

    def parse_webhook(self, request) -> WebhookEvent:
        data = request.data if hasattr(request, "data") else {}
        provider_reference = data.get("provider_reference")
        if not provider_reference:
            raise InvalidWebhook("Missing provider_reference in webhook body.")

        status = data.get("status", "succeeded")
        amount = Decimal(str(data.get("amount", "0")))
        currency = str(data.get("currency", "USD"))
        failure_reason = data.get("failure_reason", "")

        return WebhookEvent(
            provider_reference=provider_reference,
            status=status,
            amount=amount,
            currency=currency,
            payload=data,
            failure_reason=failure_reason,
        )


_PROVIDERS = {
    "dummy": DummyProvider(),
}


def get_provider(name: str) -> BasePaymentProvider:
    if name in _PROVIDERS:
        return _PROVIDERS[name]

    provider_map = getattr(settings, "PAYMENT_PROVIDERS", {})
    if name in provider_map:
        path = provider_map[name]
        try:
            cls = import_string(path)
            instance = cls()
            _PROVIDERS[name] = instance
            return instance
        except Exception as exc:
            logger.error("Failed to load payment provider '%s' from '%s': %s", name, path, exc)
            raise UnknownProvider(f"Could not initialize provider '{name}'.") from exc

    raise UnknownProvider(f"Unknown payment provider: '{name}'.")

