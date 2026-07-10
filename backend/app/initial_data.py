"""Initial data seeding script — creates database tables on first run.

Called during application startup to ensure all required database tables
exist before the API begins serving requests.
"""

import logging

from sqlmodel import Session

from app.core.db import engine, init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init() -> None:
    """Initialise the database schema within a session context."""
    with Session(engine) as session:
        init_db(session)


def main() -> None:
    """Entry point — runs DB initialisation and logs the result."""
    logger.info("Creating initial data")
    init()
    logger.info("Initial data created")


if __name__ == "__main__":
    main()
