
from typing import Any, TypeVar

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel

ModelT = TypeVar("ModelT", bound=SQLModel)


async def create_review(
    session: AsyncSession,
    review: ModelT,
) -> ModelT:
    session.add(review)
    await session.commit()
    await session.refresh(review)
    return review


async def get_review_by_id(
    session: AsyncSession,
    review_model: type[ModelT],
    review_id: Any,
) -> ModelT | None:
    return await session.get(review_model, review_id)


async def list_reviews(
    session: AsyncSession,
    review_model: type[ModelT],
    field_name: str,
    field_value: Any,
    offset: int = 0,
    limit: int = 50,
) -> list[ModelT]:
    column = getattr(review_model, field_name, None)
    if column is None:
        raise ValueError(f"Review model has no field '{field_name}'.")

    result = await session.execute(
        select(review_model)
        .where(column == field_value)
        .offset(max(offset, 0))
        .limit(min(max(limit, 1), 100))
    )
    return list(result.scalars().all())
