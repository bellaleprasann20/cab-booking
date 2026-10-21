
from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser

router = APIRouter()


@router.post("/checkout", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def create_checkout(user: CurrentUser):
    raise HTTPException(
        status_code=501,
        detail="Connect Stripe checkout to the payment service and a validated ride.",
    )


@router.get("/{payment_id}", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def get_payment(payment_id: str, user: CurrentUser):
    raise HTTPException(
        status_code=501,
        detail="Connect payment lookup to the database and verify ownership.",
    )
