import asyncio
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import select

from app.api.deps import CurrentUser, DbSession
from app.core.rate_limit import RateLimiter
from app.core.security import (
    DUMMY_PASSWORD_HASH,
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.models.wallet import Wallet
from app.schemas.user import LoginRequest, RegisterRequest, TokenResponse, UserRead

router = APIRouter()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(RateLimiter(10, 60, "register"))],
)
async def register(body: RegisterRequest, db: DbSession):
    email = body.email.lower()

    existing = (await db.exec(select(User).where(User.email == email))).first()
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    # Argon2 is CPU-heavy, so keep it off the event loop
    password_hash = await asyncio.to_thread(hash_password, body.password)

    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        auth_id=str(user_id),  # for local auth, the token's `sub` is the user id
        name=body.name.strip(),
        email=email,
        phone=body.phone,
        role=body.role,
        password_hash=password_hash,
    )

    try:
        db.add(user)
        await db.flush()
        db.add(Wallet(user_id=user_id))  # every user gets a wallet with balance 0
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    await db.refresh(user)
    token = create_access_token(str(user.id), user.role.value)
    return TokenResponse(access_token=token, user=UserRead.model_validate(user))


@router.post(
    "/login",
    response_model=TokenResponse,
    dependencies=[Depends(RateLimiter(10, 60, "login"))],
)
async def login(body: LoginRequest, db: DbSession):
    user = (await db.exec(select(User).where(User.email == body.email.lower()))).first()

    hashed = user.password_hash if user and user.password_hash else DUMMY_PASSWORD_HASH
    password_ok = await asyncio.to_thread(verify_password, body.password, hashed)

    if not user or not user.password_hash or not password_ok:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account is disabled")

    token = create_access_token(str(user.id), user.role.value)
    return TokenResponse(access_token=token, user=UserRead.model_validate(user))


@router.get("/me", response_model=UserRead)
async def get_profile(user: CurrentUser):
    return UserRead.model_validate(user)