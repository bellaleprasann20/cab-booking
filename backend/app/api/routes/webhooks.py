
import stripe

from fastapi import APIRouter, HTTPException, Request, status

from app.core.config import settings

router = APIRouter()


@router.post("/stripe", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def stripe_webhook(request: Request):
    payload = await request.body()
    signature = request.headers.get("stripe-signature")

    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe signature.",
        )

    webhook_secret = getattr(settings, "STRIPE_WEBHOOK_SECRET", None)
    if not webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe webhook is not configured.",
        )

    try:
        event = stripe.Webhook.construct_event(
            payload,
            signature,
            webhook_secret,
        )
    except (ValueError, stripe.SignatureVerificationError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook payload or signature.",
        )

    # TODO: Persist the event ID and process supported events exactly once.
    # Do not mark a ride as paid until the verified event is processed.
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=f"Verified Stripe event {event.type}; event processing is not implemented.",
    )
