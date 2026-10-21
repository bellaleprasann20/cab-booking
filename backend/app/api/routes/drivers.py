
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import CurrentUser, require_roles

router = APIRouter()


def not_implemented(operation: str):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=f"{operation} must be connected to the driver and matching services.",
    )


@router.get("/nearby", status_code=501)
async def nearby_drivers(user: CurrentUser):
    return not_implemented("Nearby driver search")


@router.get("/me")
async def driver_profile(
    user: dict = Depends(require_roles("driver")),
):
    return {"user": user}


@router.patch("/me/status", status_code=501)
async def update_driver_status(
    user: dict = Depends(require_roles("driver")),
):
    return not_implemented("Driver availability update")


@router.get("/me/requests", status_code=501)
async def incoming_requests(
    user: dict = Depends(require_roles("driver")),
):
    return not_implemented("Incoming ride requests")


@router.post("/requests/{ride_id}/accept", status_code=501)
async def accept_ride(
    ride_id: str,
    user: dict = Depends(require_roles("driver")),
):
    return not_implemented("Ride acceptance")


@router.post("/requests/{ride_id}/reject", status_code=501)
async def reject_ride(
    ride_id: str,
    user: dict = Depends(require_roles("driver")),
):
    return not_implemented("Ride rejection")
