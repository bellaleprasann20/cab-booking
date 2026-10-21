
from typing import Any, TypeVar

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel

ModelT = TypeVar("ModelT", bound=SQLModel)


async def get_driver_by_id(
    session: AsyncSession,
    driver_model: type[ModelT],
    driver_id: Any,
) -> ModelT | None:
    return await session.get(driver_model, driver_id)


async def get_driver_by_user_id(
    session: AsyncSession,
    driver_model: type[ModelT],
    user_id: Any,
    user_id_field: str = "user_id",
) -> ModelT | None:
    column = getattr(driver_model, user_id_field, None)
    if column is None:
        raise ValueError(f"Driver model has no field '{user_id_field}'.")

    result = await session.execute(
        select(driver_model).where(column == user_id)
    )
    return result.scalar_one_or_none()


async def list_available_drivers(
    session: AsyncSession,
    driver_model: type[ModelT],
    available_field: str = "is_available",
    offset: int = 0,
    limit: int = 50,
) -> list[ModelT]:
    column = getattr(driver_model, available_field, None)
    if column is None:
        raise ValueError(f"Driver model has no field '{available_field}'.")

    result = await session.execute(
        select(driver_model)
        .where(column.is_(True))
        .offset(max(offset, 0))
        .limit(min(max(limit, 1), 100))
    )
    return list(result.scalars().all())


async def save_driver(
    session: AsyncSession,
    driver: ModelT,
) -> ModelT:
    session.add(driver)
    await session.commit()
    await session.refresh(driver)
    return driver
