"""Transaction API endpoints."""

import re
from datetime import datetime, timezone
from typing import Any
import uuid as uuid_mod

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    CurrencyPair,
    Transaction,
    TransactionCreate,
    TransactionPublic,
    TransactionsPublic,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])

# Import rate locker from rates module
from app.api.routes.rates import _rate_locks, _rate_lock_mutex, _FEE_PERCENTAGE


def _validate_iban(iban: str) -> bool:
    """Basic IBAN format validation."""
    cleaned = re.sub(r"\s+", "", iban).upper()
    if len(cleaned) < 15 or len(cleaned) > 34:
        return False
    if not re.match(r"^[A-Z]{2}\d{2}[A-Z0-9]+$", cleaned):
        return False
    return True


def _get_and_validate_lock(lock_id: str, pair_id: str) -> dict[str, Any]:
    """Retrieve and validate a rate lock. Raises HTTPException if invalid/expired."""
    from app.api.routes.rates import _LOCK_TTL_SECONDS

    with _rate_lock_mutex:
        lock = _rate_locks.get(lock_id)
        if not lock:
            raise HTTPException(status_code=400, detail="Invalid or expired rate lock")
        if lock["pair_id"] != uuid_mod.UUID(pair_id):
            raise HTTPException(status_code=400, detail="Rate lock does not match currency pair")
        if datetime.now(timezone.utc) > lock["expires_at"]:
            del _rate_locks[lock_id]
            raise HTTPException(status_code=400, detail="Rate lock has expired (30s window)")
        return lock


def _enrich_transaction(tx: Transaction, session: SessionDep) -> TransactionPublic:
    """Enrich a transaction with pair info."""
    pair = session.get(CurrencyPair, tx.pair_id)
    return TransactionPublic(
        id=tx.id,
        user_id=tx.user_id,
        pair_id=tx.pair_id,
        source_amount=tx.source_amount,
        target_amount=tx.target_amount,
        locked_rate=tx.locked_rate,
        fee_amount=tx.fee_amount,
        fee_percentage=tx.fee_percentage,
        recipient_name=tx.recipient_name,
        recipient_iban=tx.recipient_iban,
        purpose=tx.purpose,
        status=tx.status,
        compliance_status=tx.compliance_status,
        compliance_score=tx.compliance_score,
        created_at=tx.created_at,
        updated_at=tx.updated_at,
        completed_at=tx.completed_at,
        pair=f"{pair.base_currency}/{pair.quote_currency}" if pair else None,
        base_currency=pair.base_currency if pair else None,
        quote_currency=pair.quote_currency if pair else None,
    )


def _build_filtered_query(
    current_user: CurrentUser,
    status_filter: str | None = None,
):
    """Build a filtered transaction query based on user role and optional status."""
    query = select(Transaction)

    if not current_user.is_superuser and current_user.role != "auditor":
        query = query.where(Transaction.user_id == current_user.id)

    if status_filter:
        query = query.where(Transaction.status == status_filter)

    return query


@router.get("", response_model=TransactionsPublic)
def read_transactions(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None, description="Filter by status"),
) -> Any:
    """
    Retrieve transactions with pagination.
    
    Regular users see only their own transactions.
    Superusers and auditors see all transactions.
    """
    base_query = _build_filtered_query(current_user, status)

    # Count
    total = session.exec(
        select(func.count()).select_from(base_query.subquery())
    ).one()

    # Get page
    transactions = session.exec(
        base_query.order_by(Transaction.created_at.desc()).offset(skip).limit(limit)
    ).all()

    data = [_enrich_transaction(tx, session) for tx in transactions]

    return TransactionsPublic(data=data, count=total)


@router.get("/{transaction_id}", response_model=TransactionPublic)
def read_transaction(
    transaction_id: str,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Get a single transaction by ID.
    """
    try:
        tx_uuid = uuid_mod.UUID(transaction_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid transaction ID format")

    tx = session.get(Transaction, tx_uuid)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Permission check: users see own, superuser/auditor see all
    if not current_user.is_superuser and current_user.role != "auditor":
        if tx.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    return _enrich_transaction(tx, session)


# ──────────────────────────────────────────────
# Create transaction (Day 7)
# ──────────────────────────────────────────────

@router.post("", response_model=TransactionPublic, status_code=201)
def create_transaction(
    tx_in: TransactionCreate,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Create a new remittance transaction.
    
    1. Validates IBAN format
    2. Validates rate lock (must be fresh, < 30s old)
    3. Calculates target amount
    4. Creates transaction record
    """
    # Parse pair
    pair_str = tx_in.pair.replace("-", "/").upper()
    parts = pair_str.split("/")
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Invalid pair format")

    base, quote = parts
    currency_pair = session.exec(
        select(CurrencyPair).where(
            CurrencyPair.base_currency == base,
            CurrencyPair.quote_currency == quote,
            CurrencyPair.is_active == True,
        )
    ).first()

    if not currency_pair:
        raise HTTPException(status_code=404, detail=f"Currency pair {pair_str} not found")

    # Validate IBAN
    if not _validate_iban(tx_in.recipient_iban):
        raise HTTPException(status_code=400, detail="Invalid IBAN format")

    # Validate rate lock
    lock = _get_and_validate_lock(tx_in.locked_rate_id, str(currency_pair.id))
    locked_rate = lock["rate"]

    # Calculate amounts
    fee_amount = round(tx_in.source_amount * _FEE_PERCENTAGE / 100, 2)
    target_amount = round((tx_in.source_amount - fee_amount) * locked_rate, 2)

    # Create transaction
    tx = Transaction(
        user_id=current_user.id,
        pair_id=currency_pair.id,
        source_amount=tx_in.source_amount,
        target_amount=target_amount,
        locked_rate=locked_rate,
        fee_amount=fee_amount,
        fee_percentage=_FEE_PERCENTAGE,
        recipient_name=tx_in.recipient_name,
        recipient_iban=tx_in.recipient_iban,
        purpose=tx_in.purpose,
        status="pending",
    )
    session.add(tx)
    session.commit()
    session.refresh(tx)

    # Clean up used lock
    with _rate_lock_mutex:
        _rate_locks.pop(tx_in.locked_rate_id, None)

    return _enrich_transaction(tx, session)
