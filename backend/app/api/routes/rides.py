
import uuid
from decimal import Decimal, ROUND_HALF_UP

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import CurrentUser
from app.core.config import settings
from app.core.database import get_db
from app.models.ride import Ride, RideStatus
from app.schemas.ride import (
    FareBreakdown,
    FareEstimateResponse,
    RideCreate,
    RideCancel,
    RideRead,
    RideDetail,
)
from app.schemas.common import LatLng
from app.services.maps_service import get_route

router = APIRouter()


def calculate_fare(distance_meters: int, duration_secs: int):
    """Calculate the fare using server-side pricing configuration."""
    distance_km = Decimal(distance_meters) / Decimal("1000")
    duration_minutes = Decimal(duration_secs) / Decimal("60")

    base = Decimal(str(settings.BASE_FARE))
    distance = distance_km * Decimal(str(settings.PER_KM_RATE))
    time = duration_minutes * Decimal(str(settings.PER_MIN_RATE))

    quantize = Decimal("0.01")
    base = base.quantize(quantize, rounding=ROUND_HALF_UP)
    distance = distance.quantize(quantize, rounding=ROUND_HALF_UP)
    time = time.quantize(quantize, rounding=ROUND_HALF_UP)

    total = (base + distance + time).quantize(
        quantize, rounding=ROUND_HALF_UP
    )

    return base, distance, time, total


def geometry_expression(lat: float, lng: float):
    """Build a PostGIS point using longitude, latitude order."""
    return func.ST_SetSRID(
        func.ST_MakePoint(lng, lat),
        4326,
    )


async def calculate_route(payload: RideCreate):
    try:
        route = get_route(
            origin=f"{payload.pickup.lat},{payload.pickup.lng}",
            destination=f"{payload.drop.lat},{payload.drop.lng}",
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to calculate a route right now.",
        ) from exc

    base, distance, time, total = calculate_fare(
        route["distance_meters"],
        route["duration_seconds"],
    )

    return route, base, distance, time, total


@router.post(
    "/estimate",
    response_model=FareEstimateResponse,
)
async def estimate_fare(
    payload: RideCreate,
    user: CurrentUser,
):
    route, base, distance, time, total = await calculate_route(payload)

    return FareEstimateResponse(
        distance_meters=route["distance_meters"],
        duration_secs=route["duration_seconds"],
        fare_estimate=total,
        currency=settings.CURRENCY.upper(),
        breakdown=FareBreakdown(
            base_fare=base,
            distance_fare=distance,
            time_fare=time,
        ),
    )


@router.post(
    "/",
    response_model=RideRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_ride(
    payload: RideCreate,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db),
):
    route, _, _, _, total = await calculate_route(payload)

    ride = Ride(
        rider_id=user.id,
        pickup_point=geometry_expression(
            payload.pickup.lat, payload.pickup.lng
        ),
        drop_point=geometry_expression(
            payload.drop.lat, payload.drop.lng
        ),
        pickup_address=payload.pickup_address,
        drop_address=payload.drop_address,
        payment_method=payload.payment_method,
        fare_estimate=total,
        distance_meters=route["distance_meters"],
        duration_secs=route["duration_seconds"],
        status=RideStatus.requested,
    )

    session.add(ride)
    await session.commit()
    await session.refresh(ride)

    # Reload geometry as latitude/longitude values for response serialization.
    statement = select(
        Ride,
        func.ST_Y(Ride.pickup_point).label("pickup_lat"),
        func.ST_X(Ride.pickup_point).label("pickup_lng"),
        func.ST_Y(Ride.drop_point).label("drop_lat"),
        func.ST_X(Ride.drop_point).label("drop_lng"),
    ).where(Ride.id == ride.id)

    result = await session.exec(statement)
    row = result.first()

    if row is None:
        raise HTTPException(status_code=500, detail="Ride could not be loaded.")

    ride, pickup_lat, pickup_lng, drop_lat, drop_lng = row

    return RideRead(
        id=ride.id,
        rider_id=ride.rider_id,
        driver_id=ride.driver_id,
        pickup=LatLng(lat=pickup_lat, lng=pickup_lng),
        drop=LatLng(lat=drop_lat, lng=drop_lng),
        pickup_address=ride.pickup_address,
        drop_address=ride.drop_address,
        status=ride.status,
        payment_method=ride.payment_method,
        fare_estimate=ride.fare_estimate,
        fare_actual=ride.fare_actual,
        discount_amount=ride.discount_amount,
        distance_meters=ride.distance_meters,
        duration_secs=ride.duration_secs,
        cancel_reason=ride.cancel_reason,
        accepted_at=ride.accepted_at,
        started_at=ride.started_at,
        completed_at=ride.completed_at,
        cancelled_at=ride.cancelled_at,
        created_at=ride.created_at,
    )


@router.get("/", response_model=list[RideRead])
async def list_rides(
    user: CurrentUser,
    session: AsyncSession = Depends(get_db),
):
    statement = (
        select(
            Ride,
            func.ST_Y(Ride.pickup_point).label("pickup_lat"),
            func.ST_X(Ride.pickup_point).label("pickup_lng"),
            func.ST_Y(Ride.drop_point).label("drop_lat"),
            func.ST_X(Ride.drop_point).label("drop_lng"),
        )
        .where(Ride.rider_id == user.id)
        .order_by(Ride.created_at.desc())
    )

    result = await session.exec(statement)
    rows = result.all()

    return [
        RideRead(
            id=ride.id,
            rider_id=ride.rider_id,
            driver_id=ride.driver_id,
            pickup=LatLng(lat=pickup_lat, lng=pickup_lng),
            drop=LatLng(lat=drop_lat, lng=drop_lng),
            pickup_address=ride.pickup_address,
            drop_address=ride.drop_address,
            status=ride.status,
            payment_method=ride.payment_method,
            fare_estimate=ride.fare_estimate,
            fare_actual=ride.fare_actual,
            discount_amount=ride.discount_amount,
            distance_meters=ride.distance_meters,
            duration_secs=ride.duration_secs,
            cancel_reason=ride.cancel_reason,
            accepted_at=ride.accepted_at,
            started_at=ride.started_at,
            completed_at=ride.completed_at,
            cancelled_at=ride.cancelled_at,
            created_at=ride.created_at,
        )
        for ride, pickup_lat, pickup_lng, drop_lat, drop_lng in rows
    ]


@router.get("/{ride_id}", response_model=RideDetail)
async def get_ride(
    ride_id: uuid.UUID,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db),
):
    statement = (
        select(
            Ride,
            func.ST_Y(Ride.pickup_point).label("pickup_lat"),
            func.ST_X(Ride.pickup_point).label("pickup_lng"),
            func.ST_Y(Ride.drop_point).label("drop_lat"),
            func.ST_X(Ride.drop_point).label("drop_lng"),
        )
        .where(
            Ride.id == ride_id,
            (Ride.rider_id == user.id) | (Ride.driver_id == user.id),
        )
    )

    result = await session.exec(statement)
    row = result.first()

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found.",
        )

    ride, pickup_lat, pickup_lng, drop_lat, drop_lng = row

    return RideDetail(
        id=ride.id,
        rider_id=ride.rider_id,
        driver_id=ride.driver_id,
        pickup=LatLng(lat=pickup_lat, lng=pickup_lng),
        drop=LatLng(lat=drop_lat, lng=drop_lng),
        pickup_address=ride.pickup_address,
        drop_address=ride.drop_address,
        status=ride.status,
        payment_method=ride.payment_method,
        fare_estimate=ride.fare_estimate,
        fare_actual=ride.fare_actual,
        discount_amount=ride.discount_amount,
        distance_meters=ride.distance_meters,
        duration_secs=ride.duration_secs,
        cancel_reason=ride.cancel_reason,
        accepted_at=ride.accepted_at,
        started_at=ride.started_at,
        completed_at=ride.completed_at,
        cancelled_at=ride.cancelled_at,
        created_at=ride.created_at,
        driver=None,
    )


@router.post("/{ride_id}/cancel", response_model=RideRead)
async def cancel_ride(
    ride_id: uuid.UUID,
    payload: RideCancel,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db),
):
    ride = await session.get(Ride, ride_id)

    if ride is None or ride.rider_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found.",
        )

    if ride.status not in (
        RideStatus.requested,
        RideStatus.accepted,
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This ride can no longer be cancelled.",
        )

    ride.status = RideStatus.cancelled
    ride.cancel_reason = payload.reason
    from datetime import datetime, timezone
    ride.cancelled_at = datetime.now(timezone.utc)

    session.add(ride)
    await session.commit()
    await session.refresh(ride)

    statement = select(
        Ride,
        func.ST_Y(Ride.pickup_point).label("pickup_lat"),
        func.ST_X(Ride.pickup_point).label("pickup_lng"),
        func.ST_Y(Ride.drop_point).label("drop_lat"),
        func.ST_X(Ride.drop_point).label("drop_lng"),
    ).where(Ride.id == ride.id)

    result = await session.exec(statement)
    row = result.first()

    ride, pickup_lat, pickup_lng, drop_lat, drop_lng = row

    return RideRead(
        id=ride.id,
        rider_id=ride.rider_id,
        driver_id=ride.driver_id,
        pickup=LatLng(lat=pickup_lat, lng=pickup_lng),
        drop=LatLng(lat=drop_lat, lng=drop_lng),
        pickup_address=ride.pickup_address,
        drop_address=ride.drop_address,
        status=ride.status,
        payment_method=ride.payment_method,
        fare_estimate=ride.fare_estimate,
        fare_actual=ride.fare_actual,
        discount_amount=ride.discount_amount,
        distance_meters=ride.distance_meters,
        duration_secs=ride.duration_secs,
        cancel_reason=ride.cancel_reason,
        accepted_at=ride.accepted_at,
        started_at=ride.started_at,
        completed_at=ride.completed_at,
        cancelled_at=ride.cancelled_at,
        created_at=ride.created_at,
    )
