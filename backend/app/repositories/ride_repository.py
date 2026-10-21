
from typing import Any, TypeVar

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel

ModelT = TypeVar("ModelT", bound=SQLModel)


async def create_ride(
    session: AsyncSession,
    ride: ModelT,
) -> ModelT:
    session.add(ride)
    await session.commit()
    await session.refresh(ride)
    return ride


async def get_ride_by_id(
    session: AsyncSession,
    ride_model: type[ModelT],
    ride_id: Any,
) -> ModelT | None:
    return await session.get(ride_model, ride_id)


async def list_rides(
    session: AsyncSession,
    ride_model: type[ModelT],
    field_name: str | None = None,
    field_value: Any = None,
    offset: int = 0,
    limit: int = 50,
) -> list[ModelT]:
    statement = select(ride_model)

    if field_name is not None:
        column = getattr(ride_model, field_name, None)
        if column is None:
            raise ValueError(f"Ride model has no field '{field_name}'.")
        statement = statement.where(column == field_value)

    statement = statement.offset(max(offset, 0)).limit(
        min(max(limit, 1), 100)
    )

    result = await session.execute(statement)
    return list(result.scalars().all())


async def save_ride(
    session: AsyncSession,
    ride: ModelT,
) -> ModelT:
    session.add(ride)
    await session.commit()
    await session.refresh(ride)
    return ride
