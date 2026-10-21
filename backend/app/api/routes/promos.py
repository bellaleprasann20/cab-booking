
from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser

router = APIRouter()


@router.post("/validate", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def validate_promo(user: CurrentUser):
    raise HTTPException(
        status_code=501,
        detail="Connect promo validation to the promo service, expiry, and usage limits.",
    )


@router.post("/", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def create_promo(user: CurrentUser):
    raise HTTPException(
        status_code=501,
        detail="Connect promo creation to an admin-authorized promo service.",
    )
