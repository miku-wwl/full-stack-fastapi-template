"""Shared fixtures and configuration for ForeXchange test suite."""

import uuid
from collections.abc import Generator
from datetime import datetime, timezone

import pytest
from sqlmodel import Session, SQLModel, create_engine

from app.core.security import get_password_hash
from app.models import CurrencyPair, RateSnapshot, Transaction, User

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, echo=False)


@pytest.fixture(autouse=True)
def setup_database() -> Generator[None, None, None]:
    """Create tables before each test and drop them after."""
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)


@pytest.fixture()
def session() -> Generator[Session, None, None]:
    """Provide a database session for testing."""
    with Session(engine) as session:
        yield session


@pytest.fixture()
def admin_user(session: Session) -> User:
    """Create and return a test admin user."""
    user = User(
        email="admin@test.com",
        hashed_password=get_password_hash("testpassword123"),
        is_superuser=True,
        role="auditor",
        full_name="Test Admin",
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture()
def customer_user(session: Session) -> User:
    """Create and return a test customer user."""
    user = User(
        email="customer@test.com",
        hashed_password=get_password_hash("customerpass123"),
        is_superuser=False,
        role="customer",
        full_name="Test Customer",
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture()
def currency_pair(session: Session) -> CurrencyPair:
    """Create and return a test currency pair (USD/EUR)."""
    pair = CurrencyPair(base_currency="USD", quote_currency="EUR", is_active=True)
    session.add(pair)
    session.commit()
    session.refresh(pair)
    return pair


@pytest.fixture()
def rate_snapshot(session: Session, currency_pair: CurrencyPair) -> RateSnapshot:
    """Create and return a test rate snapshot."""
    snapshot = RateSnapshot(
        pair_id=currency_pair.id,
        bid=0.920000,
        ask=0.920500,
        mid=0.920250,
        spread=0.000500,
        change_pct=0.05,
    )
    session.add(snapshot)
    session.commit()
    session.refresh(snapshot)
    return snapshot


@pytest.fixture()
def transaction(session: Session, admin_user: User, currency_pair: CurrencyPair) -> Transaction:
    """Create and return a test transaction."""
    tx = Transaction(
        user_id=admin_user.id,
        pair_id=currency_pair.id,
        source_amount=1000.00,
        target_amount=920.25,
        locked_rate=0.920250,
        fee_amount=5.00,
        fee_percentage=0.5,
        recipient_name="Test Recipient",
        recipient_iban="GB29NWBK60161331926819",
        purpose="personal",
        status="completed",
        compliance_status="pass",
        compliance_score=15,
    )
    session.add(tx)
    session.commit()
    session.refresh(tx)
    return tx
