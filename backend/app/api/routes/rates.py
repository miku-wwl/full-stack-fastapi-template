"""Forex rates API endpoints."""

from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    CurrencyPair,
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
        # Get the latest snapshot for this pair
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
    # Support both USD-EUR and USD/EUR formats
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
