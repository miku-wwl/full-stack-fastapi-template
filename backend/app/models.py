import uuid
from datetime import datetime, timezone
from typing import Any

from pydantic import EmailStr
from sqlalchemy import DateTime, JSON
from sqlmodel import Field, Relationship, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)
    role: str = Field(default="customer", max_length=20)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)
    role: str = Field(default="customer")


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore[assignment]
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    pass


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime | None = None


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"
    role: str = "customer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


# ──────────────────────────────────────────────
# Forex models
# ──────────────────────────────────────────────

class CurrencyPairBase(SQLModel):
    base_currency: str = Field(max_length=3, index=True)
    quote_currency: str = Field(max_length=3, index=True)
    is_active: bool = True


class CurrencyPair(CurrencyPairBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


class CurrencyPairPublic(CurrencyPairBase):
    id: uuid.UUID
    created_at: datetime | None = None


class RateSnapshotBase(SQLModel):
    pair_id: uuid.UUID = Field(foreign_key="currencypair.id", index=True)
    bid: float
    ask: float
    mid: float
    spread: float
    change_pct: float = 0.0


class RateSnapshot(RateSnapshotBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    timestamp: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


class RateSnapshotPublic(RateSnapshotBase):
    id: uuid.UUID
    timestamp: datetime | None = None


class RateWithPair(SQLModel):
    """Rate response including pair info."""
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
    # Joined fields
    pair: str | None = None
    base_currency: str | None = None
    quote_currency: str | None = None


class TransactionsPublic(SQLModel):
    data: list[TransactionPublic]
    count: int


# ──────────────────────────────────────────────
# Dashboard models
# ──────────────────────────────────────────────

class DashboardSummary(SQLModel):
    active_pairs: int
    today_transactions: int
    total_volume_usd: float
    flagged_count: int
    avg_processing_time_ms: float = 0.0


# ──────────────────────────────────────────────
# Compliance models (Day 9)
# ──────────────────────────────────────────────

class ComplianceOverview(SQLModel):
    flagged_count: int
    reviewed_today: int
    approved_today: int
    rejected_today: int
    pass_rate: float = 0.0


class ComplianceReviewRequest(SQLModel):
    action: str  # "approve" or "reject"
    reason: str | None = None



# ──────────────────────────────────────────────
# Transaction Create & Rate Lock models (Day 7)
# ──────────────────────────────────────────────

class TransactionCreate(SQLModel):
    pair: str  # e.g. "USD/EUR"
    source_amount: float
    recipient_name: str
    recipient_iban: str
    purpose: str = "personal"
    locked_rate_id: str  # UUID from /rates/lock


class RateLockResponse(SQLModel):
    lock_id: str
    pair: str
    rate: float
    bid: float
    ask: float
    fee_percentage: float = 0.5
    fee_amount: float = 0.0
    expires_at: str  # ISO timestamp
    valid_seconds: int = 30
