
from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser

router = APIRouter()


@router.post("/", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def create_review(user: CurrentUser):
    raise HTTPException(
        status_code=501,
        detail="Connect review creation to the review service and completed-ride validation.",
    )


@router.get("/ride/{ride_id}", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def get_ride_reviews(ride_id: str, user: CurrentUser):
    raise HTTPException(
        status_code=501,
        detail="Connect ride reviews to the database.",
    )
