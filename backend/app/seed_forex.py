"""Seed forex data and start background rate generation."""

import logging
import threading
import time

from sqlmodel import Session

from app.core.db import engine
from app.forex import ForexSimulator, generate_rate_snapshots, seed_currency_pairs
from app.models import CurrencyPair, RateSnapshot
from sqlmodel import select

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_forex_data() -> None:
    """Seed currency pairs and generate initial rate snapshots."""
    logger.info("Seeding forex data...")

    with Session(engine) as session:
        # Create currency pairs
        pairs = seed_currency_pairs(session)
        logger.info(f"Created/verified {len(pairs)} currency pairs")

        # Generate initial snapshots
        snapshots = generate_rate_snapshots(session, pairs)
        logger.info(f"Generated {len(snapshots)} initial rate snapshots")

    logger.info("Forex seed data complete")


def start_rate_generator(interval_seconds: int = 5) -> threading.Thread:
    """Start a background thread that generates new rate snapshots periodically."""
    simulator = ForexSimulator()

    def _generate_rates() -> None:
        while True:
            try:
                with Session(engine) as session:
                    pairs = session.exec(
                        select(CurrencyPair).where(CurrencyPair.is_active == True)
                    ).all()

                    for pair in pairs:
                        snapshot = simulator.generate_snapshot(pair)
                        session.add(snapshot)

                    session.commit()
                    logger.debug(f"Generated {len(pairs)} rate snapshots")
            except Exception as e:
                logger.error(f"Error generating rates: {e}")

            time.sleep(interval_seconds)

    thread = threading.Thread(target=_generate_rates, daemon=True, name="forex-rate-generator")
    thread.start()
    logger.info(f"Started rate generator (every {interval_seconds}s)")
    return thread


if __name__ == "__main__":
    seed_forex_data()
    start_rate_generator()

    # Keep the main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Rate generator stopped")
