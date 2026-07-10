"""Utility endpoints for health checks, email testing, and data sovereignty info.

Provides non-business endpoints used for infrastructure monitoring,
configuration verification, and compliance documentation.
"""

from fastapi import APIRouter, Depends
from pydantic.networks import EmailStr

from app.api.deps import get_current_active_superuser
from app.models import Message
from app.utils import generate_test_email, send_email

router = APIRouter(prefix="/utils", tags=["utils"])


@router.post(
    "/test-email/",
    dependencies=[Depends(get_current_active_superuser)],
    status_code=201,
)
def test_email(email_to: EmailStr) -> Message:
    """Send a test email to verify SMTP configuration (superuser only)."""
    email_data = generate_test_email(email_to=email_to)
    send_email(
        email_to=email_to,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message="Test email sent")


@router.get("/health-check/")
async def health_check() -> Message:
    """Return a simple health check response for Docker and monitoring tools."""
    return Message(message="Hello World")


@router.get("/data-sovereignty/", response_model=dict)
async def data_sovereignty() -> dict:
    """
    Return the data sovereignty and privacy principles that ForeXchange follows.

    This endpoint documents the system's approach to data collection, storage,
    access control, and user rights — aligned with Te Mana Raraunga (Māori Data
    Sovereignty Network) principles and the New Zealand Privacy Act 2020.
    """
    return {
        "principles": [
            "collection_consent",
            "encrypted_storage",
            "role_based_access",
            "right_to_deletion",
            "audit_trail",
        ],
        "data_categories": [
            "email",
            "full_name",
            "recipient_iban",
            "transaction_history",
        ],
        "retention_policy": "Data is retained until account deletion request",
        "encryption": {
            "in_transit": "TLS 1.2+",
            "at_rest": "PostgreSQL encryption",
            "passwords": "Argon2id + Bcrypt hashing",
        },
        "access_control": "JWT-based role access (Customer / Auditor)",
        "standards": [
            "Te Mana Raraunga — Māori Data Sovereignty Principles",
            "New Zealand Privacy Act 2020",
        ],
    }
