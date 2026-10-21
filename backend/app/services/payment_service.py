
import stripe

from app.core.config import settings


def configure_stripe():
    secret_key = getattr(settings, "STRIPE_SECRET_KEY", None)

    if not secret_key:
        raise RuntimeError("Stripe secret key is not configured.")

    stripe.api_key = secret_key


def create_payment_intent(
    amount_minor: int,
    currency: str = "inr",
    metadata: dict | None = None,
):
    if amount_minor <= 0:
        raise ValueError("Payment amount must be positive.")

    configure_stripe()

    return stripe.PaymentIntent.create(
        amount=amount_minor,
        currency=currency.lower(),
        metadata=metadata or {},
    )


def retrieve_payment_intent(payment_intent_id: str):
    configure_stripe()
    return stripe.PaymentIntent.retrieve(payment_intent_id)
