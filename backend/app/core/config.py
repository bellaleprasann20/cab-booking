from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Reads backend/.env, or the root .env when run from backend/
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    APP_NAME: str = "Cab Booking Platform"
    ENVIRONMENT: str = "development"  # development | production
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    # Comma-separated list, e.g. "http://localhost:5173,https://myapp.vercel.app"
    CORS_ORIGINS: str = "http://localhost:5173"

    # Database / cache
    DATABASE_URL: str = "postgresql+asyncpg://cab:cab@localhost:5432/cabdb"
    REDIS_URL: str = "redis://localhost:6379/0"

    # Auth: "local" (email + password), "clerk" or "supabase"
    AUTH_PROVIDER: str = "local"

    # Local auth (used when AUTH_PROVIDER=local)
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Clerk (used when AUTH_PROVIDER=clerk)
    CLERK_JWKS_URL: str = ""   # https://<your-instance>.clerk.accounts.dev/.well-known/jwks.json
    CLERK_ISSUER: str = ""     # https://<your-instance>.clerk.accounts.dev

    # Supabase (used when AUTH_PROVIDER=supabase)
    SUPABASE_URL: str = ""
    SUPABASE_JWT_SECRET: str = ""  # leave empty to use the project's JWKS instead

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # Maps
    GOOGLE_MAPS_API_KEY: str = ""

    # Fare pricing (change freely)
    BASE_FARE: float = 50.0
    PER_KM_RATE: float = 12.0
    PER_MIN_RATE: float = 1.5
    CURRENCY: str = "inr"

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Email (receipts)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "no-reply@cabbooking.local"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()