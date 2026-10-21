
import os
import smtplib
from email.message import EmailMessage

from app.tasks.celery_app import celery_app


@celery_app.task(
    name="app.tasks.email_tasks.send_email",
    bind=True,
    max_retries=3,
    default_retry_delay=30,
)
def send_email(
    self,
    recipient: str,
    subject: str,
    body: str,
):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    sender = os.getenv("SMTP_FROM_EMAIL", smtp_user or "")

    if not all([smtp_host, smtp_user, smtp_password, sender]):
        raise ValueError("SMTP environment variables are not configured")

    message = EmailMessage()
    message["From"] = sender
    message["To"] = recipient
    message["Subject"] = subject
    message.set_content(body)

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(message)

        return {
            "success": True,
            "recipient": recipient,
            "message": "Email sent successfully",
        }

    except (smtplib.SMTPException, OSError) as exc:
        raise self.retry(exc=exc)
