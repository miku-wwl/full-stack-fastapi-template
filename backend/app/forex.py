"""Forex rate simulator for generating realistic exchange rate data."""

import random
from datetime import datetime, timezone

from sqlmodel import Session, select

from app.models import CurrencyPair, RateSnapshot


# Default currency pairs with approximate base rates
DEFAULT_PAIRS = {
    ("USD", "EUR"): 0.9215,
    ("USD", "GBP"): 0.7920,
    ("USD", "JPY"): 149.50,
    ("USD", "CHF"): 0.8790,
    ("USD", "AUD"): 1.5340,
    ("USD", "CAD"): 1.3620,
    ("EUR", "GBP"): 0.8595,
    ("EUR", "JPY"): 162.25,
    ("GBP", "JPY"): 188.75,
    ("USD", "NZD"): 1.6280,
    ("USD", "SGD"): 1.3450,
    ("USD", "HKD"): 7.8120,
}


class ForexSimulator:
    """Generates realistic forex rate snapshots with small random fluctuations."""

    def __init__(self, volatility: float = 0.0002):
        """
        Args:
            volatility: Max percentage change per snapshot (default 0.02%)
        """
        self.volatility = volatility
        self._last_rates: dict[str, float] = {}

    def _get_base_rate(self, pair: CurrencyPair) -> float:
        """Get the base rate for a currency pair."""
        key = (pair.base_currency, pair.quote_currency)
        if key in DEFAULT_PAIRS:
            return DEFAULT_PAIRS[key]
        # Fallback: generate a reasonable rate
        return round(random.uniform(0.5, 150.0), 4)

    def _fluctuate(self, rate: float) -> float:
        """Apply a small random fluctuation to a rate."""
        change = rate * random.uniform(-self.volatility, self.volatility)
        return round(rate + change, 6)

    def generate_snapshot(self, pair: CurrencyPair) -> RateSnapshot:
        """Generate a new rate snapshot for a currency pair."""
        pair_key = f"{pair.base_currency}/{pair.quote_currency}"

        # Get or initialize the last known rate
        if pair_key not in self._last_rates:
            self._last_rates[pair_key] = self._get_base_rate(pair)

        # Apply fluctuation
        mid = self._fluctuate(self._last_rates[pair_key])
        self._last_rates[pair_key] = mid

        # Calculate bid/ask with spread
        spread_pct = random.uniform(0.0002, 0.0008)  # 0.02% to 0.08% spread
        half_spread = mid * spread_pct
        bid = round(mid - half_spread, 6)
        ask = round(mid + half_spread, 6)
        spread = round(ask - bid, 6)

        # Calculate change percentage from initial rate
        base_rate = self._get_base_rate(pair)
        change_pct = round(((mid - base_rate) / base_rate) * 100, 4)

        return RateSnapshot(
            pair_id=pair.id,
            bid=bid,
            ask=ask,
            mid=mid,
            spread=spread,
            change_pct=change_pct,
        )


def seed_currency_pairs(session: Session) -> list[CurrencyPair]:
    """Create default currency pairs if they don't exist."""
    pairs = []
    for (base, quote) in DEFAULT_PAIRS:
        existing = session.exec(
            select(CurrencyPair).where(
                CurrencyPair.base_currency == base,
                CurrencyPair.quote_currency == quote,
            )
        ).first()

        if existing:
            pairs.append(existing)
            continue

        pair = CurrencyPair(base_currency=base, quote_currency=quote)
        session.add(pair)
        pairs.append(pair)

    session.commit()

    # Refresh to get IDs
    for pair in pairs:
        session.refresh(pair)

    return pairs


def generate_rate_snapshots(session: Session, pairs: list[CurrencyPair]) -> list[RateSnapshot]:
    """Generate initial rate snapshots for all pairs."""
    simulator = ForexSimulator()
    snapshots = []

    for pair in pairs:
        snapshot = simulator.generate_snapshot(pair)
        session.add(snapshot)
        snapshots.append(snapshot)

    session.commit()

    for snapshot in snapshots:
        session.refresh(snapshot)

    return snapshots
