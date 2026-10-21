
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import get_db, require_roles
from app.models.driver import Driver, DriverStatus
from app.models.user import User

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


@router.get("/drivers")
async def list_drivers(
    user: dict = Depends(require_roles("admin")),
    session: AsyncSession = Depends(get_db),
):
    statement = (
        select(Driver, User)
        .join(User, User.id == Driver.user_id)
        .order_by(Driver.created_at.desc())
    )

    results = (await session.exec(statement)).all()

    drivers = []

    for driver, account in results:
        drivers.append(
            {
                "driver_id": str(driver.user_id),
                "user_id": str(account.id),
                "name": account.name,
                "email": account.email,
                "phone": account.phone,
                "vehicle_make": driver.vehicle_make,
                "vehicle_model": driver.vehicle_model,
                "vehicle_color": driver.vehicle_color,
                "vehicle_number": driver.vehicle_plate,
                "license_number": driver.license_number,
                "verification_status": (
                    "verified" if driver.verified else "pending"
                ),
                "is_verified": driver.verified,
                "status": driver.status.value,
                "created_at": driver.created_at,
            }
        )

    return {
        "count": len(drivers),
        "drivers": drivers,
    }


@router.patch("/drivers/{driver_id}/verify")
async def verify_driver(
    driver_id: str,
    user: dict = Depends(require_roles("admin")),
    session: AsyncSession = Depends(get_db),
):
    try:
        parsed_driver_id = uuid.UUID(driver_id)
    except (ValueError, TypeError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid driver ID.",
        )

    driver = await session.get(Driver, parsed_driver_id)

    if driver is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver profile not found.",
        )

    if driver.verified:
        return {
            "message": "Driver is already verified.",
            "driver_id": str(driver.user_id),
            "is_verified": True,
        }

    try:
        driver.verified = True

        # Approval does not automatically put the driver online.
        driver.status = DriverStatus.offline

        session.add(driver)
        await session.commit()
        await session.refresh(driver)

    except SQLAlchemyError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not verify the driver. Please try again.",
        )

    return {
        "message": "Driver verified successfully.",
        "driver_id": str(driver.user_id),
        "is_verified": driver.verified,
        "status": driver.status.value,
    }
