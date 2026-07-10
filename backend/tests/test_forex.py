"""Tests for forex rate simulator (ForexSimulator class)."""

from unittest.mock import patch

from sqlmodel import Session

from app.forex import ForexSimulator, _compute_cross_rate, seed_currency_pairs
from app.models import CurrencyPair


class TestForexSimulator:
    """Tests for the ForexSimulator class."""

    def test_initialisation_with_fixed_rates(self) -> None:
        """Verify that ForexSimulator can be initialised with fixed base rates."""
        simulator = ForexSimulator(base_rates={"EUR": 0.92, "GBP": 0.79})
        assert simulator.base_rates["EUR"] == 0.92
        assert simulator.base_rates["GBP"] == 0.79
        assert simulator.volatility == 0.0002

    def test_fluctuate_returns_different_value(self) -> None:
        """Verify that _fluctuate returns a value close to but different from the input."""
        simulator = ForexSimulator(base_rates={"EUR": 0.92})
        original = 1.234567
        fluctuated = simulator._fluctuate(original)
        assert fluctuated != original
        # The change should be within ±volatility range
        change_pct = abs(fluctuated - original) / original
        assert change_pct <= simulator.volatility * 1.5  # Allow small tolerance

    def test_generate_snapshot_returns_valid_object(self, session: Session) -> None:
        """Verify that generate_snapshot returns a valid RateSnapshot."""
        # Create a currency pair first
        pair = CurrencyPair(base_currency="USD", quote_currency="EUR", is_active=True)
        session.add(pair)
        session.commit()
        session.refresh(pair)

        simulator = ForexSimulator(base_rates={"EUR": 0.92})
        snapshot = simulator.generate_snapshot(pair)

        assert snapshot.pair_id == pair.id
        assert snapshot.bid > 0
        assert snapshot.ask > 0
        assert snapshot.mid > 0
        assert snapshot.spread >= 0
        assert snapshot.ask >= snapshot.bid


class TestComputeCrossRate:
    """Tests for the _compute_cross_rate helper function."""

    def test_compute_eur_gbp_cross_rate(self) -> None:
        """Verify that EUR/GBP cross rate is computed as GBP rate / EUR rate."""
        rate = _compute_cross_rate({"EUR": 0.92, "GBP": 0.79}, "EUR", "GBP")
        expected = round(0.79 / 0.92, 6)
        assert rate == expected

    def test_compute_gbp_jpy_cross_rate(self) -> None:
        """Verify that GBP/JPY cross rate is computed as JPY rate / GBP rate."""
        rate = _compute_cross_rate({"GBP": 0.79, "JPY": 149.5}, "GBP", "JPY")
        expected = round(149.5 / 0.79, 6)
        assert rate == expected

    def test_compute_missing_base_rate_returns_fallback(self) -> None:
        """Verify that a missing base currency returns fallback value 1.0."""
        rate = _compute_cross_rate({"EUR": 0.92}, "XYZ", "EUR")
        assert rate == 1.0


class TestSeedCurrencyPairs:
    """Tests for seed_currency_pairs()."""

    def test_seed_creates_pairs(self, session: Session) -> None:
        """Verify that seed_currency_pairs creates the default currency pairs."""
        pairs = seed_currency_pairs(session)
        assert len(pairs) > 0
        assert any(p.base_currency == "USD" and p.quote_currency == "EUR" for p in pairs)

    def test_seed_is_idempotent(self, session: Session) -> None:
        """Verify that calling seed_currency_pairs twice doesn't duplicate pairs."""
        pairs1 = seed_currency_pairs(session)
        pairs2 = seed_currency_pairs(session)
        assert len(pairs1) == len(pairs2)
