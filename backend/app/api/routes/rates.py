"""Forex rates API endpoints."""

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    CurrencyPair,
    RateLockResponse,
    RateSnapshot,
    RateWithPair,
)

router = APIRouter(prefix="/rates", tags=["rates"])


@router.get("/live", response_model=list[RateWithPair])
def read_rates_live(
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """Get latest live rates for all active currency pairs."""
    pairs = session.exec(
        select(CurrencyPair).where(CurrencyPair.is_active == True)
    ).all()

    results = []
    for pair in pairs:
        latest = session.exec(
            select(RateSnapshot)
            .where(RateSnapshot.pair_id == pair.id)
            .order_by(RateSnapshot.timestamp.desc())
            .limit(1)
        ).first()

        if latest:
            results.append(
                RateWithPair(
                    pair=f"{pair.base_currency}/{pair.quote_currency}",
                    base_currency=pair.base_currency,
                    quote_currency=pair.quote_currency,
                    bid=latest.bid,
                    ask=latest.ask,
                    mid=latest.mid,
                    spread=latest.spread,
                    change_pct=latest.change_pct,
                    timestamp=latest.timestamp,
                )
            )

    return results


@router.get("/live/{pair}", response_model=RateWithPair)
def read_rate_pair(
    pair: str,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """Get latest rate for a specific currency pair (e.g. USD-EUR or USD/EUR)."""
    pair = pair.replace("-", "/").upper()
    parts = pair.split("/")
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Invalid pair format. Use BASE-QUOTE (e.g. USD-EUR)")

    base, quote = parts

    currency_pair = session.exec(
        select(CurrencyPair).where(
            CurrencyPair.base_currency == base,
            CurrencyPair.quote_currency == quote,
            CurrencyPair.is_active == True,
        )
    ).first()

    if not currency_pair:
        raise HTTPException(status_code=404, detail=f"Currency pair {pair} not found")

    latest = session.exec(
        select(RateSnapshot)
        .where(RateSnapshot.pair_id == currency_pair.id)
        .order_by(RateSnapshot.timestamp.desc())
        .limit(1)
    ).first()

    if not latest:
        raise HTTPException(status_code=404, detail=f"No rate data for {pair}")

    return RateWithPair(
        pair=f"{base}/{quote}",
        base_currency=base,
        quote_currency=quote,
        bid=latest.bid,
        ask=latest.ask,
        mid=latest.mid,
        spread=latest.spread,
        change_pct=latest.change_pct,
        timestamp=latest.timestamp,
    )


# ──────────────────────────────────────────────
# History endpoint (Day 6)
# ──────────────────────────────────────────────

_RANGE_MAP = {
    "1h": timedelta(hours=1),
    "6h": timedelta(hours=6),
    "24h": timedelta(hours=24),
    "7d": timedelta(days=7),
}

_INTERVAL_MAP = {
    "1m": timedelta(minutes=1),
    "5m": timedelta(minutes=5),
    "1h": timedelta(hours=1),
}


@router.get("/history/{pair}", response_model=list[dict[str, Any]])
def read_rate_history(
    pair: str,
    session: SessionDep,
    current_user: CurrentUser,
    range: str = Query("24h", description="Time range: 1h, 6h, 24h, 7d"),
    interval: str = Query("5m", description="Sampling interval: 1m, 5m, 1h"),
) -> Any:
    """
    Get historical rate data for a currency pair.
    Returns time-series of {timestamp, bid, ask, mid} downsampled by interval.
    """
    # Parse pair
    pair = pair.replace("-", "/").upper()
    parts = pair.split("/")
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Invalid pair format. Use BASE-QUOTE (e.g. USD-EUR)")

    base, quote = parts
    currency_pair = session.exec(
        select(CurrencyPair).where(
            CurrencyPair.base_currency == base,
            CurrencyPair.quote_currency == quote,
            CurrencyPair.is_active == True,
        )
    ).first()

    if not currency_pair:
        raise HTTPException(status_code=404, detail=f"Currency pair {pair} not found")

    # Validate range / interval
    if range not in _RANGE_MAP:
        raise HTTPException(status_code=400, detail=f"Invalid range. Choose: {', '.join(_RANGE_MAP)}")
    if interval not in _INTERVAL_MAP:
        raise HTTPException(status_code=400, detail=f"Invalid interval. Choose: {', '.join(_INTERVAL_MAP)}")

    # Time window
    since = datetime.now(timezone.utc) - _RANGE_MAP[range]

    # Query snapshots in window, ordered by time
    rows = session.exec(
        select(RateSnapshot)
        .where(
            RateSnapshot.pair_id == currency_pair.id,
            RateSnapshot.timestamp >= since,
        )
        .order_by(RateSnapshot.timestamp.asc())
    ).all()

    if not rows:
        return []

    # Downsample: pick one row per interval bucket
    bucket_secs = int(_INTERVAL_MAP[interval].total_seconds())
    bucketed: dict[int, RateSnapshot] = {}

    for row in rows:
        epoch = int(row.timestamp.timestamp())
        bucket_key = (epoch // bucket_secs) * bucket_secs
        # Keep the latest snapshot in each bucket
        if bucket_key not in bucketed or row.timestamp > bucketed[bucket_key].timestamp:
            bucketed[bucket_key] = row

    # Build sorted result
    result = []
    for ts in sorted(bucketed):
        snap = bucketed[ts]
        result.append({
            "timestamp": snap.timestamp.isoformat(),
            "bid": snap.bid,
            "ask": snap.ask,
            "mid": snap.mid,
        })

    return result


# ──────────────────────────────────────────────
# Rate lock endpoint (Day 7)
# ──────────────────────────────────────────────

import uuid as _uuid
import threading

_rate_locks: dict[str, dict[str, Any]] = {}
_rate_lock_mutex = threading.Lock()

_LOCK_TTL_SECONDS = 30
_FEE_PERCENTAGE = 0.5


@router.post("/lock", response_model=RateLockResponse)
def lock_rate(
    pair: str,
    source_amount: float = 1000.0,
    session: SessionDep = None,
    current_user: CurrentUser = None,
) -> Any:
    """
    Lock the current exchange rate for a currency pair.
    Returns a lock_id valid for 30 seconds.
    """
    pair = pair.replace("-", "/").upper()
    parts = pair.split("/")
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
        raise HTTPException(status_code=404, detail=f"Currency pair {pair} not found")

    latest = session.exec(
        select(RateSnapshot)
        .where(RateSnapshot.pair_id == currency_pair.id)
        .order_by(RateSnapshot.timestamp.desc())
        .limit(1)
    ).first()

    if not latest:
        raise HTTPException(status_code=404, detail=f"No rate data for {pair}")

    lock_id = str(_uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=_LOCK_TTL_SECONDS)
    fee_amount = round(source_amount * _FEE_PERCENTAGE / 100, 2)

    lock_data = {
        "rate": latest.mid,
        "pair_id": currency_pair.id,
        "expires_at": expires_at,
        "base_currency": base,
        "quote_currency": quote,
    }

    with _rate_lock_mutex:
        _rate_locks[lock_id] = lock_data

    return RateLockResponse(
        lock_id=lock_id,
        pair=pair,
        rate=latest.mid,
        bid=latest.bid,
        ask=latest.ask,
        fee_percentage=_FEE_PERCENTAGE,
        fee_amount=fee_amount,
        expires_at=expires_at.isoformat(),
        valid_seconds=_LOCK_TTL_SECONDS,
    )
