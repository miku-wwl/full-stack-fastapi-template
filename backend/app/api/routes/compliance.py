"""Compliance audit API endpoints — Auditor only."""

import random
from datetime import datetime, timezone
from typing import Any
import uuid as uuid_mod

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    ComplianceOverview,
    ComplianceReviewRequest,
    CurrencyPair,
    Message,
    Transaction,
    TransactionPublic,
    TransactionsPublic,
)

router = APIRouter(prefix="/compliance", tags=["compliance"])


def _require_auditor(current_user: CurrentUser) -> None:
    """Ensure only auditors or superusers can access compliance endpoints."""
    if not current_user.is_superuser and current_user.role != "auditor":
        raise HTTPException(status_code=403, detail="Auditor access required")


def _enrich_tx(tx: Transaction, session: SessionDep) -> TransactionPublic:
    pair = session.get(CurrencyPair, tx.pair_id)
    return TransactionPublic(
        id=tx.id, user_id=tx.user_id, pair_id=tx.pair_id,
        source_amount=tx.source_amount, target_amount=tx.target_amount,
        locked_rate=tx.locked_rate, fee_amount=tx.fee_amount,
        fee_percentage=tx.fee_percentage, recipient_name=tx.recipient_name,
        recipient_iban=tx.recipient_iban, purpose=tx.purpose,
        status=tx.status, compliance_status=tx.compliance_status,
        compliance_score=tx.compliance_score,
        compliance_details=tx.compliance_details,
        created_at=tx.created_at, updated_at=tx.updated_at,
        completed_at=tx.completed_at,
        pair=f"{pair.base_currency}/{pair.quote_currency}" if pair else None,
        base_currency=pair.base_currency if pair else None,
        quote_currency=pair.quote_currency if pair else None,
    )


def _run_compliance_rules(tx: Transaction) -> tuple[int, list[dict]]:
    """Run 4 AML compliance rules against a transaction. Returns (score 0-100, details)."""
    score = 0
    rules_triggered: list[dict] = []

    # Rule 1: Large amount (> $10,000)
    if tx.source_amount > 10000:
        score += 30
        rules_triggered.append({"rule": "LARGE_AMOUNT", "detail": f"${tx.source_amount:,.2f}"})

    # Rule 2: High-risk IBAN country code (simulated)
    high_risk_prefixes = ["XX", "YY", "IR", "KP"]
    if tx.recipient_iban[:2].upper() in high_risk_prefixes:
        score += 35
        rules_triggered.append({"rule": "HIGH_RISK_COUNTRY", "detail": f"IBAN prefix: {tx.recipient_iban[:2]}"})

    # Rule 3: Random spot-check (simulated)
    if random.random() < 0.05:
        score += 20
        rules_triggered.append({"rule": "RANDOM_SPOT_CHECK", "detail": "Transaction randomly selected for audit"})

    # Rule 4: Structuring pattern (amount just below round numbers)
    if 9000 < tx.source_amount < 10000 or 4900 < tx.source_amount < 5000:
        score += 25
        rules_triggered.append({"rule": "STRUCTURING", "detail": f"${tx.source_amount:,.2f} just below threshold"})

    return min(score, 100), rules_triggered


# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────

@router.get("/overview", response_model=ComplianceOverview)
def get_compliance_overview(
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """Get compliance statistics (Auditor only)."""
    _require_auditor(current_user)

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    flagged_count = session.exec(
        select(func.count()).select_from(Transaction).where(Transaction.status == "flagged")
    ).one()

    # Reviewed today = approved + rejected today
    reviewed_today = session.exec(
        select(func.count()).select_from(Transaction).where(
            Transaction.status.in_(["completed", "rejected"]),
            Transaction.compliance_status.isnot(None),
            Transaction.updated_at >= today_start,
        )
    ).one()

    approved_today = session.exec(
        select(func.count()).select_from(Transaction).where(
            Transaction.status == "completed",
            Transaction.compliance_status == "pass",
            Transaction.updated_at >= today_start,
        )
    ).one()

    rejected_today = session.exec(
        select(func.count()).select_from(Transaction).where(
            Transaction.status == "rejected",
            Transaction.updated_at >= today_start,
        )
    ).one()

    total = flagged_count + reviewed_today
    pass_rate = round((approved_today / reviewed_today * 100), 1) if reviewed_today > 0 else 0.0

    return ComplianceOverview(
        flagged_count=flagged_count,
        reviewed_today=reviewed_today,
        approved_today=approved_today,
        rejected_today=rejected_today,
        pass_rate=pass_rate,
    )


@router.get("/flagged", response_model=TransactionsPublic)
def get_flagged_transactions(
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """Get all flagged transactions, sorted by risk score descending."""
    _require_auditor(current_user)

    txs = session.exec(
        select(Transaction)
        .where(Transaction.status == "flagged")
        .order_by(Transaction.compliance_score.desc().nullslast(), Transaction.created_at.desc())
    ).all()

    data = [_enrich_tx(tx, session) for tx in txs]
    return TransactionsPublic(data=data, count=len(data))


@router.get("/{tx_id}", response_model=TransactionPublic)
def get_compliance_detail(
    tx_id: str,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """Get single transaction compliance detail."""
    _require_auditor(current_user)
    try:
        tx_uuid = uuid_mod.UUID(tx_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid transaction ID")
    tx = session.get(Transaction, tx_uuid)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return _enrich_tx(tx, session)


@router.post("/review/{tx_id}", response_model=Message)
def review_transaction(
    tx_id: str,
    review: ComplianceReviewRequest,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """Approve or reject a flagged transaction."""
    _require_auditor(current_user)
    if review.action not in ("approve", "reject"):
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")
    if review.action == "reject" and not review.reason:
        raise HTTPException(status_code=400, detail="Rejection requires a reason")

    try:
        tx_uuid = uuid_mod.UUID(tx_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid transaction ID")

    tx = session.get(Transaction, tx_uuid)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    now = datetime.now(timezone.utc)
    if review.action == "approve":
        tx.status = "completed"
        tx.compliance_status = "pass"
        tx.updated_at = now
        tx.completed_at = now
        session.add(tx)
        session.commit()
        return Message(message=f"Transaction {tx_id[:8]} approved")

    # Reject
    tx.status = "rejected"
    tx.compliance_status = "failed"
    tx.updated_at = now
    session.add(tx)
    session.commit()
    return Message(message=f"Transaction {tx_id[:8]} rejected: {review.reason}")
