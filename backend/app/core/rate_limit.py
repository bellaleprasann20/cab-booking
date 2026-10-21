from fastapi import HTTPException, Request, status
from redis.exceptions import RedisError

from app.core.config import settings
from app.core.logging_config import get_logger
from app.core.redis_client import redis_client

logger = get_logger(__name__)


class RateLimiter:
    """Fixed-window limiter backed by Redis, used as a route dependency.

    Usage:
        @router.post("/request", dependencies=[Depends(RateLimiter(10, 60, "ride_request"))])
    """

    def __init__(
        self,
        limit: int | None = None,
        window_seconds: int = 60,
        scope: str = "global",
    ):
        self.limit = limit or settings.RATE_LIMIT_PER_MINUTE
        self.window = window_seconds
        self.scope = scope

    async def __call__(self, request: Request) -> None:
        client_ip = request.client.host if request.client else "unknown"
        key = f"rl:{self.scope}:{client_ip}"

        try:
            pipe = redis_client.pipeline()
            pipe.incr(key)
            pipe.expire(key, self.window, nx=True)  # set TTL only on the first hit
            count, _ = await pipe.execute()
        except RedisError:
            # If Redis is down, let requests through instead of taking the API down
            logger.warning("Rate limiter skipped: Redis unavailable")
            return

        if count > self.limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please slow down.",
                headers={"Retry-After": str(self.window)},
            )