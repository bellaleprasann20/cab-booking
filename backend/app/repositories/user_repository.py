
from typing import Any, TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel

ModelT = TypeVar("ModelT", bound=SQLModel)


async def create_user(
    session: AsyncSession,
    user: ModelT,
) -> ModelT:
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def get_user_by_id(
    session: AsyncSession,
    user_model: type[ModelT],
    user_id: Any,
) -> ModelT | None:
    return await session.get(user_model, user_id)


async def get_user_by_email(
    session: AsyncSession,
    user_model: type[ModelT],
    email: str,
    email_field: str = "email",
) -> ModelT | None:
    column = getattr(user_model, email_field, None)
    if column is None:
        raise ValueError(f"User model has no field '{email_field}'.")

    result = await session.execute(
        select(user_model).where(func.lower(column) == email.strip().lower())
    )
    return result.scalar_one_or_none()


async def list_users(
    session: AsyncSession,
    user_model: type[ModelT],
    offset: int = 0,
    limit: int = 50,
) -> list[ModelT]:
    result = await session.execute(
        select(user_model).offset(max(offset, 0)).limit(min(max(limit, 1), 100))
    )
    return list(result.scalars().all())


async def delete_user(
    session: AsyncSession,
    user: ModelT,
) -> None:
    await session.delete(user)
    await session.commit()
