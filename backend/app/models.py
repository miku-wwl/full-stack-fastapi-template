"""Data models for ForeXchange application.

Defines all SQLModel ORM classes for User, CurrencyPair, RateSnapshot,
Transaction, and related Pydantic schemas for request/response validation.
"""

import uuid
from datetime import datetime, timezone
from typing import Any

from pydantic import EmailStr
from sqlalchemy import DateTime, JSON
from sqlmodel import Field, Relationship, SQLModel


def get_datetime_utc() -> datetime:
    """Return the current UTC datetime for use as a default field value."""
    return datetime.now(timezone.utc)


# Shared properties
default_role = "customer"


class UserBase(SQLModel):
    """Base User model with shared fields for creation, update, and response."""
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)
    role: str = Field(default="customer", max_length=20)


class UserCreate(UserBase):
    """Schema for creating a new user via API. Adds password to base fields."""
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    """Schema for public user self-registration. All fields are user-provided."""
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)
    role: str = Field(default="customer")


class UserUpdate(UserBase):
    """Schema for updating a user. All fields are optional for partial updates."""
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore[assignment]
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateMe(SQLModel):
    """Schema for users updating their own profile. Only name and email are changeable."""
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    """Schema for password change requests. Requires both current and new password."""
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class User(UserBase, table=True):
    """Database User model. Maps to the 'user' table via SQLModel."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    pass


class UserPublic(UserBase):
    """Public user response schema. Excludes hashed_password."""
    id: uuid.UUID
    created_at: datetime | None = None


class UsersPublic(SQLModel):
    """Paginated user list response."""
    data: list[UserPublic]
    count: int


class Message(SQLModel):
    """Generic message response for status notifications."""
    message: str


class Token(SQLModel):
    """JWT token response returned after successful authentication."""
    access_token: str
    token_type: str = "bearer"
    role: str = "customer"


class TokenPayload(SQLModel):
    """Decoded JWT token payload containing the user identifier."""
    sub: str | None = None


class NewPassword(SQLModel):
    """Schema for setting a new password using a reset token."""
    token: str
    new_password: str = Field(min_length=8, max_length=128)


# ──────────────────────────────────────────────
# Forex models
# ──────────────────────────────────────────────

class CurrencyPairBase(SQLModel):
    """Base model for a forex currency pair (e.g. USD/EUR)."""
    base_currency: str = Field(max_length=3, index=True)
    quote_currency: str = Field(max_length=3, index=True)
    is_active: bool = True


class CurrencyPair(CurrencyPairBase, table=True):
    """Database model for currency pairs with auto-generated ID and timestamp."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


class CurrencyPairPublic(CurrencyPairBase):
    """Public response schema for a currency pair."""
    id: uuid.UUID
    created_at: datetime | None = None


class RateSnapshotBase(SQLModel):
    """Base model for a single exchange rate snapshot at a point in time."""
    pair_id: uuid.UUID = Field(foreign_key="currencypair.id", index=True)
    bid: float
    ask: float
    mid: float
    spread: float
    change_pct: float = 0.0


class RateSnapshot(RateSnapshotBase, table=True):
    """Database model for rate snapshots with auto-generated timestamp."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    timestamp: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


class RateSnapshotPublic(RateSnapshotBase):
    """Public response schema for a rate snapshot."""
    id: uuid.UUID
    timestamp: datetime | None = None


class RateWithPair(SQLModel):
    """Rate response including human-readable pair info (e.g. 'USD/EUR')."""
    pair: str
    base_currency: str
    quote_currency: str
    bid: float
    ask: float
    mid: float
    spread: float
    change_pct: float
    timestamp: datetime | None = None


# ──────────────────────────────────────────────
# Transaction models
# ──────────────────────────────────────────────

class TransactionBase(SQLModel):
    """Base model for a cross-border remittance transaction."""
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    pair_id: uuid.UUID = Field(foreign_key="currencypair.id")
    source_amount: float
    target_amount: float | None = None
    locked_rate: float
    fee_amount: float = 0.0
    fee_percentage: float = 0.0
    recipient_name: str = Field(max_length=255)
    recipient_iban: str = Field(max_length=34)
    purpose: str = Field(default="personal", max_length=50)
    status: str = Field(default="pending", max_length=20)
    compliance_status: str | None = Field(default=None, max_length=20)
    compliance_score: int | None = None
    compliance_details: dict[str, Any] | None = Field(default=None, sa_type=JSON)


class Transaction(TransactionBase, table=True):
    """Database model for transactions with lifecycle timestamps."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    completed_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


class TransactionPublic(SQLModel):
    """Public transaction response with optional joined currency pair fields."""
    id: uuid.UUID
    user_id: uuid.UUID
    pair_id: uuid.UUID
    source_amount: float
    target_amount: float | None = None
    locked_rate: float
    fee_amount: float
    fee_percentage: float
    recipient_name: str
    recipient_iban: str
    purpose: str
    status: str
    compliance_status: str | None = None
    compliance_score: int | None = None
    compliance_details: dict[str, Any] | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    completed_at: datetime | None = None
    # Joined fields populated via SQL JOIN in the query layer
    pair: str | None = None
    base_currency: str | None = None
    quote_currency: str | None = None


class TransactionsPublic(SQLModel):
    """Paginated transaction list response with total count."""
    data: list[TransactionPublic]
    count: int


# ──────────────────────────────────────────────
# Dashboard models
# ──────────────────────────────────────────────

class DashboardSummary(SQLModel):
    """Aggregated dashboard statistics for the homepage overview."""
    active_pairs: int
    today_transactions: int
    total_volume_usd: float
    flagged_count: int
    avg_processing_time_ms: float = 0.0


# ──────────────────────────────────────────────
# Compliance models (Day 9)
# ──────────────────────────────────────────────

class ComplianceOverview(SQLModel):
    """Compliance audit overview statistics for the Auditor dashboard."""
    flagged_count: int
    reviewed_today: int
    approved_today: int
    rejected_today: int
    pass_rate: float = 0.0


class ComplianceReviewRequest(SQLModel):
    """Request body for auditor review actions (approve/reject a flagged transaction)."""
    action: str  # "approve" or "reject"
    reason: str | None = None



# ──────────────────────────────────────────────
# Transaction Create & Rate Lock models (Day 7)
# ──────────────────────────────────────────────

class TransactionCreate(SQLModel):
    """Request body for initiating a new cross-border remittance transaction."""
    pair: str  # e.g. "USD/EUR"
    source_amount: float
    recipient_name: str
    recipient_iban: str
    purpose: str = "personal"
    locked_rate_id: str  # UUID returned from the /rates/lock endpoint


class RateLockResponse(SQLModel):
    """Response returned after successfully locking an exchange rate for 30 seconds."""
    lock_id: str
    pair: str
    rate: float
    bid: float
    ask: float
    fee_percentage: float = 0.5
    fee_amount: float = 0.0
    expires_at: str  # ISO timestamp
    valid_seconds: int = 30
