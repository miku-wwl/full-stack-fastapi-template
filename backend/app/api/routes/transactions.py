"""Transaction API endpoints."""

from typing import Any
import uuid as uuid_mod

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    CurrencyPair,
    Transaction,
    TransactionPublic,
    TransactionsPublic,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


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
