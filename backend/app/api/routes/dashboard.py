"""Dashboard aggregate API endpoints."""

from typing import Any
from datetime import datetime, timezone

from fastapi import APIRouter
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import CurrencyPair, DashboardSummary, Transaction

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _get_today_start() -> datetime:
    """Get the start of today in UTC."""
    now = datetime.now(timezone.utc)
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


def _is_auditor(user: CurrentUser) -> bool:
    """Check if the user has auditor or superuser privileges."""
    return user.is_superuser or user.role == "auditor"


@router.get("/summary", response_model=DashboardSummary)
def read_dashboard_summary(
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Get dashboard aggregate statistics.
    
    - Auditors/Superusers: see all transactions globally.
    - Regular customers: see only their own transaction data.
    """
    is_auditor = _is_auditor(current_user)

    # Active currency pairs (global — always visible)
    active_pairs = session.exec(
        select(func.count()).select_from(CurrencyPair).where(
            CurrencyPair.is_active == True
        )
    ).one()

    # Build base query for transactions — scoped to user if not auditor
    today_start = _get_today_start()
    tx_base = select(Transaction).where(Transaction.created_at >= today_start)

    if not is_auditor:
        tx_base = tx_base.where(Transaction.user_id == current_user.id)

    # Today's transactions (scoped)
    today_transactions = session.exec(
        select(func.count()).select_from(tx_base.subquery())
    ).one()

    # Total volume (scoped)
    total_volume_result = session.exec(
        select(func.coalesce(func.sum(Transaction.source_amount), 0.0))
        .select_from(tx_base.subquery())
    ).one()
    total_volume_usd = float(total_volume_result)

    # Flagged count — only visible to auditors
    if is_auditor:
        flagged_count = session.exec(
            select(func.count()).select_from(Transaction).where(
                Transaction.status == "flagged"
            )
        ).one()
    else:
        flagged_count = 0

    # Average processing time (scoped)
    completed_base = tx_base.where(Transaction.completed_at.isnot(None))
    avg_time_result = session.exec(
        select(
            func.coalesce(
                func.avg(
                    func.extract(
                        "epoch",
                        Transaction.completed_at - Transaction.created_at
                    )
                ),
                0.0,
            )
        ).select_from(completed_base.subquery())
    ).one()
    avg_processing_time_ms = float(avg_time_result) * 1000

    return DashboardSummary(
        active_pairs=active_pairs,
        today_transactions=today_transactions,
        total_volume_usd=round(total_volume_usd, 2),
        flagged_count=flagged_count,
        avg_processing_time_ms=round(avg_processing_time_ms, 0),
    )
