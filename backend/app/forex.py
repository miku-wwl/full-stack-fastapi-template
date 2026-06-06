"""Forex rate simulator for generating realistic exchange rate data.

Uses Frankfurter API (ECB data) for benchmark rates, then applies small
random fluctuations to simulate live market movement.
"""

import logging
import random
from datetime import datetime, timezone

import httpx
from sqlmodel import Session, select

from app.models import CurrencyPair, RateSnapshot

logger = logging.getLogger(__name__)

# Frankfurter API endpoint (no API key needed, ECB official data)
FRANKFURTER_API = "https://api.frankfurter.dev/v1/latest"

# Default currency pairs to simulate (rates fetched from Frankfurter)
DEFAULT_PAIRS = [
    ("USD", "EUR"),
    ("USD", "GBP"),
    ("USD", "JPY"),
    ("USD", "CHF"),
    ("USD", "AUD"),
    ("USD", "CAD"),
    ("EUR", "GBP"),
    ("EUR", "JPY"),
    ("GBP", "JPY"),
    ("USD", "NZD"),
    ("USD", "SGD"),
    ("USD", "HKD"),
]


def fetch_frankfurter_base_rates() -> dict[str, float]:
    """Fetch latest benchmark rates from Frankfurter API (ECB data).

    Returns a dict of currency_code -> rate (base = USD).
    Falls back to hardcoded approximate rates if the API is unreachable.
    """
    fallback_rates = {
        "EUR": 0.92, "GBP": 0.79, "JPY": 149.5, "CHF": 0.88,
        "AUD": 1.53, "CAD": 1.36, "NZD": 1.63, "SGD": 1.35, "HKD": 7.81,
    }

    try:
        resp = httpx.get(f"{FRANKFURTER_API}?from=USD", timeout=10)
        resp.raise_for_status()
        data = resp.json()
        rates: dict[str, float] = data.get("rates", {})
        logger.info(
            "Fetched %d benchmark rates from Frankfurter (date: %s)",
            len(rates), data.get("date", "unknown"),
        )
        return rates
    except Exception as e:
        logger.warning(
            "Could not fetch Frankfurter rates: %s. Using fallback rates.", e
        )
        return fallback_rates


def _compute_cross_rate(
    base_rates: dict[str, float],
    base_currency: str,
    quote_currency: str,
) -> float:
    """
    Compute a cross rate from USD-based benchmark rates.

    Given USD/base = R_base and USD/quote = R_quote:
      base/quote = R_quote / R_base
    """
    rate_base = base_rates.get(base_currency)
    rate_quote = base_rates.get(quote_currency)

    if rate_base and rate_quote:
        return round(rate_quote / rate_base, 6)
    # Fallback
    return 1.0


class ForexSimulator:
    """Generates realistic forex rate snapshots with small random fluctuations.

    Benchmarked against ECB official rates (via Frankfurter API) so the
    simulated mid-price stays anchored to reality.
    """

    def __init__(
        self,
        base_rates: dict[str, float] | None = None,
        volatility: float = 0.0002,
    ):
        """
        Args:
            base_rates: dict of currency_code -> rate (base=USD).
                        If None, fetched from Frankfurter API.
            volatility: Max percentage change per snapshot (default 0.02%)
        """
        self.base_rates = base_rates or fetch_frankfurter_base_rates()
        self.volatility = volatility
        self._last_rates: dict[str, float] = {}

    def _get_base_rate(self, pair: CurrencyPair) -> float:
        """Get the benchmark rate for a currency pair from ECB data."""
        # Direct USD/XXX pairs
        if pair.base_currency == "USD":
            return self.base_rates.get(pair.quote_currency, 1.0)

        # Cross pairs — compute from USD-based rates
        return _compute_cross_rate(
            self.base_rates,
            pair.base_currency,
            pair.quote_currency,
        )

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

        # Calculate change percentage from ECB benchmark
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


def generate_rate_snapshots(
    session: Session,
    pairs: list[CurrencyPair],
    base_rates: dict[str, float] | None = None,
) -> list[RateSnapshot]:
    """Generate initial rate snapshots for all pairs."""
    simulator = ForexSimulator(base_rates=base_rates)
    snapshots = []

    for pair in pairs:
        snapshot = simulator.generate_snapshot(pair)
        session.add(snapshot)
        snapshots.append(snapshot)

    session.commit()

    for snapshot in snapshots:
        session.refresh(snapshot)

    return snapshots
