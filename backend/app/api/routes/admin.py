
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import require_roles

router = APIRouter()


def not_implemented(operation: str):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=f"{operation} must be connected to the admin service and database.",
    )


@router.get("/dashboard")
async def dashboard(
    user: dict = Depends(require_roles("admin")),
):
    return not_implemented("Admin dashboard")


@router.get("/rides", status_code=501)
async def manage_rides(
    user: dict = Depends(require_roles("admin")),
):
    return not_implemented("Admin ride management")


@router.get("/drivers", status_code=501)
async def list_drivers(
    user: dict = Depends(require_roles("admin")),
):
    return not_implemented("Admin driver listing")


@router.patch("/drivers/{driver_id}/verify", status_code=501)
async def verify_driver(
    driver_id: str,
    user: dict = Depends(require_roles("admin")),
):
    return not_implemented("Driver verification")
