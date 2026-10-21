
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_db
from app.core.security import verify_token
from app.models.user import User, UserRole


bearer_scheme = HTTPBearer(auto_error=False)

DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    creds: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
    db: DbSession,
) -> User:
    """Validate the bearer token and retrieve the active user."""

    if creds is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    claims = await verify_token(creds.credentials)

    result = await db.exec(
        select(User).where(User.auth_id == claims["sub"])
    )
    user = result.first()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_role(*roles: UserRole):
    """Require one of the specified UserRole values."""

    async def checker(user: CurrentUser) -> User:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed for your role",
            )

        return user

    return checker


def require_roles(*roles: str | UserRole):
    """Require one of the specified role names or UserRole values."""

    allowed_roles = {
        role.value if isinstance(role, UserRole) else role
        for role in roles
    }

    async def checker(user: CurrentUser) -> User:
        if user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed for your role",
            )

        return user

    return checker
