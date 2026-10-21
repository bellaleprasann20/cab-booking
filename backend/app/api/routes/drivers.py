
import uuid
from datetime import datetime, time, timedelta, timezone
from decimal import Decimal
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import require_roles
from app.core.database import get_db
from app.models.driver import Driver, DriverStatus
from app.models.ride import Ride, RideStatus
from app.models.review import Review
from app.models.user import User


router = APIRouter()

DbSession = Depends(get_db)


def not_implemented(operation: str):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=f"{operation} must be connected to the driver and matching services.",
    )


class AvailabilityUpdate(BaseModel):
    is_available: bool


def driver_profile_data(user: User, driver: Driver | None) -> dict:
    """Return profile fields in the format expected by the frontend."""
    return {
        "user_id": str(user.id),
        "name": user.name,
        "full_name": user.name,
        "email": user.email,
        "phone": user.phone,
        "profile_pic": user.profile_pic,
        "rating": user.rating_avg,
        "rating_avg": user.rating_avg,
        "rating_count": user.rating_count,
        "vehicle_make": driver.vehicle_make if driver else None,
        "vehicle_model": driver.vehicle_model if driver else None,
        "vehicle_color": driver.vehicle_color if driver else None,
        "vehicle_number": driver.vehicle_plate if driver else None,
        "vehicle_plate": driver.vehicle_plate if driver else None,
        "license_number": driver.license_number if driver else None,
        "verification_status": (
            "verified" if driver and driver.verified else "pending"
        ),
        "is_verified": driver.verified if driver else False,
        "is_available": bool(
            driver and driver.status == DriverStatus.active
        ),
        "available": bool(
            driver and driver.status == DriverStatus.active
        ),
        "status": driver.status.value if driver else DriverStatus.offline.value,
    }


@router.get("/nearby", status_code=501)
async def nearby_drivers(
    user: User = Depends(require_roles("rider")),
):
    return not_implemented("Nearby driver search")


@router.get("/me")
async def driver_profile(
    user: User = Depends(require_roles("driver")),
    session: AsyncSession = DbSession,
):
    driver = await session.get(Driver, user.id)
    return {"driver": driver_profile_data(user, driver)}


@router.get("/me/dashboard")
async def driver_dashboard(
    user: User = Depends(require_roles("driver")),
    session: AsyncSession = DbSession,
):
    driver = await session.get(Driver, user.id)

    if driver is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver profile not found. Complete driver onboarding first.",
        )

    # Use India-local calendar boundaries for today's statistics.
    india_tz = ZoneInfo("Asia/Kolkata")
    now_local = datetime.now(india_tz)
    start_local = datetime.combine(
        now_local.date(), time.min, tzinfo=india_tz
    )
    end_local = start_local + timedelta(days=1)

    start_utc = start_local.astimezone(timezone.utc)
    end_utc = end_local.astimezone(timezone.utc)

    completed_status = RideStatus.completed

    today_completed_result = await session.exec(
        select(func.count())
        .select_from(Ride)
        .where(
            Ride.driver_id == user.id,
            Ride.status == completed_status,
            Ride.completed_at >= start_utc,
            Ride.completed_at < end_utc,
        )
    )
    completed_rides_today = today_completed_result.one()

    earnings_result = await session.exec(
        select(func.coalesce(func.sum(Ride.fare_actual), 0))
        .where(
            Ride.driver_id == user.id,
            Ride.status == completed_status,
            Ride.completed_at >= start_utc,
            Ride.completed_at < end_utc,
        )
    )
    today_earnings = earnings_result.one()

    total_result = await session.exec(
        select(func.count())
        .select_from(Ride)
        .where(Ride.driver_id == user.id)
    )
    total_rides = total_result.one()

    active_result = await session.exec(
        select(Ride)
        .where(
            Ride.driver_id == user.id,
            Ride.status.in_(
                [
                    RideStatus.accepted,
                    RideStatus.driver_arrived,
                    RideStatus.in_progress,
                ]
            ),
        )
        .order_by(Ride.created_at.desc())
        .limit(1)
    )
    active_ride = active_result.first()

    # Calculate the average from reviews received by this driver.
    rating_result = await session.exec(
        select(func.avg(Review.rating), func.count(Review.id))
        .where(Review.rated_id == user.id)
    )
    rating_row = rating_result.one()
    average_rating = (
        float(rating_row[0])
        if rating_row[0] is not None
        else float(user.rating_avg or 0)
    )

    active_ride_data = None
    if active_ride is not None:
        active_ride_data = {
            "id": str(active_ride.id),
            "ride_id": str(active_ride.id),
            "status": active_ride.status.value,
            "pickup_address": active_ride.pickup_address,
            "drop_address": active_ride.drop_address,
            "destination_address": active_ride.drop_address,
            "fare_estimate": str(active_ride.fare_estimate),
            "fare_actual": (
                str(active_ride.fare_actual)
                if active_ride.fare_actual is not None
                else None
            ),
            "created_at": active_ride.created_at.isoformat(),
        }

    return {
        "dashboard": {
            "today_earnings": str(
                today_earnings
                if isinstance(today_earnings, Decimal)
                else Decimal(str(today_earnings))
            ),
            "completed_rides_today": int(completed_rides_today or 0),
            "total_rides": int(total_rides or 0),
            "average_rating": round(average_rating, 2),
            "active_ride": active_ride_data,
        }
    }


@router.patch("/me/status")
async def update_driver_status(
    payload: dict,
    user: User = Depends(require_roles("driver")),
    session: AsyncSession = DbSession,
):
    # Keep the existing status endpoint compatible with status-based clients.
    requested_status = payload.get("status")
    allowed = {DriverStatus.active.value, DriverStatus.offline.value}

    if requested_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Status must be 'active' or 'offline'.",
        )

    return await set_driver_status(
        session, user.id, DriverStatus(requested_status)
    )


async def set_driver_status(
    session: AsyncSession,
    user_id: uuid.UUID,
    requested_status: DriverStatus,
):
    driver = await session.get(Driver, user_id)

    if driver is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver profile not found. Complete driver onboarding first.",
        )

    if driver.status == DriverStatus.on_ride:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Availability cannot be changed while a ride is in progress.",
        )

    driver.status = requested_status
    session.add(driver)
    await session.commit()
    await session.refresh(driver)

    return {
        "driver": {
            "user_id": str(driver.user_id),
            "status": driver.status.value,
            "is_available": driver.status == DriverStatus.active,
            "available": driver.status == DriverStatus.active,
        }
    }


@router.patch("/me/availability")
async def update_driver_availability(
    payload: AvailabilityUpdate,
    user: User = Depends(require_roles("driver")),
    session: AsyncSession = DbSession,
):
    requested_status = (
        DriverStatus.active
        if payload.is_available
        else DriverStatus.offline
    )
    return await set_driver_status(session, user.id, requested_status)


@router.get("/me/requests", status_code=501)
async def incoming_requests(
    user: User = Depends(require_roles("driver")),
):
    return not_implemented("Incoming ride requests")


@router.post("/requests/{ride_id}/accept", status_code=501)
async def accept_ride(
    ride_id: str,
    user: User = Depends(require_roles("driver")),
):
    return not_implemented("Ride acceptance")


@router.post("/requests/{ride_id}/reject", status_code=501)
async def reject_ride(
    ride_id: str,
    user: User = Depends(require_roles("driver")),
):
    return not_implemented("Ride rejection")
