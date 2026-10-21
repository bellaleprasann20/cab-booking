
from typing import Any, TypeVar

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel

ModelT = TypeVar("ModelT", bound=SQLModel)


async def create_payment(
    session: AsyncSession,
    payment: ModelT,
) -> ModelT:
    session.add(payment)
    await session.commit()
    await session.refresh(payment)
    return payment


async def get_payment_by_id(
    session: AsyncSession,
    payment_model: type[ModelT],
    payment_id: Any,
) -> ModelT | None:
    return await session.get(payment_model, payment_id)


async def find_payment(
    session: AsyncSession,
    payment_model: type[ModelT],
    field_name: str,
    field_value: Any,
) -> ModelT | None:
    column = getattr(payment_model, field_name, None)
    if column is None:
        raise ValueError(f"Payment model has no field '{field_name}'.")

    result = await session.execute(
        select(payment_model).where(column == field_value)
    )
    return result.scalar_one_or_none()


async def save_payment(
    session: AsyncSession,
    payment: ModelT,
) -> ModelT:
    session.add(payment)
    await session.commit()
    await session.refresh(payment)
    return payment
