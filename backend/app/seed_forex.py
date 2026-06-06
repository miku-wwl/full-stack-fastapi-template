"""Seed forex data and start background rate generation."""

import logging
import random
import threading
import time
from datetime import datetime, timedelta, timezone

from sqlmodel import Session, select

from app.core.db import engine
from app.forex import ForexSimulator, generate_rate_snapshots, seed_currency_pairs
from app.models import CurrencyPair, RateSnapshot, Transaction, User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _get_or_create_admin(session: Session) -> User:
    """Get the admin/superuser for seeding transactions."""
    admin = session.exec(
        select(User).where(User.is_superuser == True)
    ).first()
    return admin


def seed_transactions(session: Session) -> None:
    """Seed demo transactions for dashboard display."""
    admin = _get_or_create_admin(session)
    if not admin:
        logger.warning("No superuser found, skipping transaction seed")
        return

    pairs = session.exec(
        select(CurrencyPair).where(CurrencyPair.is_active == True)
    ).all()

    if not pairs:
        logger.warning("No currency pairs found, skipping transaction seed")
        return

    # Check if transactions already exist
    existing = session.exec(select(Transaction).limit(1)).first()
    if existing:
        logger.info("Transactions already exist, skipping seed")
        return

    mock_recipients = [
        ("Maria Garcia", "ES9121000418450200051332", "family_support"),
        ("Jean Dupont", "FR7630001007941234567890185", "business"),
        ("Hans Mueller", "DE89370400440532013000", "education"),
        ("Yuki Tanaka", "JP2100012345678901234567890", "travel"),
        ("Li Wei", "GB29NWBK60161331926819", "family_support"),
        ("Anna Rossi", "IT60X0542811101000000123456", "medical"),
        ("Carlos Silva", "PT50000201231234567890154", "personal"),
        ("Emma Wilson", "NL91ABNA0417164300", "business"),
    ]

    statuses = ["completed", "completed", "completed", "completed", "completed", "flagged", "completed", "processing"]
    compliance_statuses = ["pass", "pass", "pass", "pass", "pass", "flagged", "pass", "pending"]

    now = datetime.now(timezone.utc)

    for i, (name, iban, purpose) in enumerate(mock_recipients):
        pair = random.choice(pairs)
        base_rate = 0.92 if pair.quote_currency == "EUR" else (
            0.79 if pair.quote_currency == "GBP" else (
                149.50 if pair.quote_currency == "JPY" else 1.0
            )
        )
        source_amount = round(random.uniform(100, 5000), 2)
        fee_pct = round(random.uniform(0.3, 1.5), 2)
        fee_amount = round(source_amount * fee_pct / 100, 2)
        target_amount = round((source_amount - fee_amount) * base_rate, 2)

        status = statuses[i] if i < len(statuses) else "completed"
        cs = compliance_statuses[i] if i < len(compliance_statuses) else "pass"
        created = now - timedelta(hours=random.randint(0, 5), minutes=random.randint(0, 59))

        tx = Transaction(
            user_id=admin.id,
            pair_id=pair.id,
            source_amount=source_amount,
            target_amount=target_amount,
            locked_rate=base_rate,
            fee_amount=fee_amount,
            fee_percentage=fee_pct,
            recipient_name=name,
            recipient_iban=iban,
            purpose=purpose,
            status=status,
            compliance_status=cs,
            compliance_score=random.randint(5, 90) if cs == "flagged" else random.randint(0, 25),
            created_at=created,
            updated_at=created + timedelta(seconds=random.randint(1, 60)),
            completed_at=created + timedelta(seconds=random.randint(30, 300)) if status == "completed" else None,
        )
        session.add(tx)

    session.commit()
    logger.info(f"Seeded {len(mock_recipients)} demo transactions")


def backfill_rate_history(session: Session, pairs: list[CurrencyPair]) -> None:
    """Generate historical snapshots for the past 24h at ~5min intervals."""
    existing = session.exec(
        select(RateSnapshot).where(RateSnapshot.timestamp < datetime.now(timezone.utc) - timedelta(hours=1))
    ).first()
    if existing:
        logger.info("Historical backfill already exists, skipping")
        return

    simulator = ForexSimulator()
    now = datetime.now(timezone.utc)
    interval = timedelta(minutes=5)
    hours_back = 24
    ticks = (hours_back * 60) // 5  # 288 ticks

    logger.info("Backfilling %d historical ticks x %d pairs...", ticks, len(pairs))
    count = 0
    for i in range(ticks, 0, -1):
        ts = now - interval * i
        for pair in pairs:
            snap = simulator.generate_snapshot(pair)
            snap.timestamp = ts
            session.add(snap)
            count += 1
        if i % 72 == 0:  # flush every 6 hours
            session.flush()

    session.commit()
    logger.info("Backfilled %d historical snapshots (24h)", count)


def seed_forex_data() -> None:
    """Seed currency pairs, generate initial rate snapshots, and demo transactions."""
    logger.info("Seeding forex data...")

    with Session(engine) as session:
        # Create currency pairs
        pairs = seed_currency_pairs(session)
        logger.info(f"Created/verified {len(pairs)} currency pairs")

        # Generate initial snapshots
        snapshots = generate_rate_snapshots(session, pairs)
        logger.info(f"Generated {len(snapshots)} initial rate snapshots")

        # Backfill 24h history for charts
        backfill_rate_history(session, pairs)

        # Seed demo transactions
        seed_transactions(session)

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
