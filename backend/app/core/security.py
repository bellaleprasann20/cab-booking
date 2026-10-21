import asyncio
from datetime import datetime, timedelta, timezone
from functools import lru_cache

import jwt
from fastapi import HTTPException, status
from jwt import PyJWKClient
from pwdlib import PasswordHash

from app.core.config import settings

# ---------- Passwords (argon2) ----------

_password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return _password_hash.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    try:
        return _password_hash.verify(password, hashed)
    except Exception:
        return False


# Verified against when the email doesn't exist, so response time
# doesn't reveal which emails are registered
DUMMY_PASSWORD_HASH = _password_hash.hash("not-a-real-password")


# ---------- Tokens ----------

def create_access_token(user_id: str, role: str) -> str:
    if not settings.JWT_SECRET:
        raise RuntimeError("JWT_SECRET is not set")
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


@lru_cache
def _jwks_client(url: str) -> PyJWKClient:
    # Caches signing keys so we don't call the auth provider on every request
    return PyJWKClient(url, cache_keys=True, lifespan=3600)


def _decode(token: str) -> dict:
    provider = settings.AUTH_PROVIDER.lower()

    if provider == "local":
        if not settings.JWT_SECRET:
            raise RuntimeError("JWT_SECRET is not set")
        return jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"require": ["exp", "sub"]},
        )

    if provider == "clerk":
        if not settings.CLERK_JWKS_URL:
            raise RuntimeError("CLERK_JWKS_URL is not set")
        key = _jwks_client(settings.CLERK_JWKS_URL).get_signing_key_from_jwt(token).key
        return jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER or None,
            options={"verify_aud": False, "require": ["exp", "sub"]},
        )

    if provider == "supabase":
        if settings.SUPABASE_JWT_SECRET:
            return jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
                options={"require": ["exp", "sub"]},
            )
        if not settings.SUPABASE_URL:
            raise RuntimeError("SUPABASE_URL or SUPABASE_JWT_SECRET must be set")
        jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        key = _jwks_client(jwks_url).get_signing_key_from_jwt(token).key
        return jwt.decode(
            token,
            key,
            algorithms=["RS256", "ES256"],
            audience="authenticated",
            options={"require": ["exp", "sub"]},
        )

    raise RuntimeError(f"Unknown AUTH_PROVIDER: {settings.AUTH_PROVIDER}")


async def verify_token(token: str) -> dict:
    """Verify a JWT and return its claims (`sub` = the user's auth id)."""
    try:
        # PyJWKClient does blocking HTTP on a cache miss, so run it in a thread
        return await asyncio.to_thread(_decode, token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")