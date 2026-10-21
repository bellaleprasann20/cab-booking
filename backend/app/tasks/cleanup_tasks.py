
import logging

from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(
    name="app.tasks.cleanup_tasks.cleanup_expired_data"
)
def cleanup_expired_data():
    """
    Scheduled daily at 2:00 AM.

    TODO:
    1. Open an async database session.
    2. Find records that are expired according to the actual model fields.
    3. Delete or archive only records permitted by the retention policy.
    4. Commit the transaction and log the number of affected records.
    """
    logger.warning(
        "Expired-data cleanup has not been connected to database models yet."
    )

    return {
        "success": True,
        "status": "pending_integration",
        "message": "No records were deleted; database cleanup is not configured.",
    }
