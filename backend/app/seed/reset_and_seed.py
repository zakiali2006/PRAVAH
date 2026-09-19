"""
PRAVAH Dev-Safe Reset & Seed

Usage:
    python -m app.seed.reset_and_seed

This script:
  1. Checks ENV == 'development' (refuses to run otherwise).
  2. Runs `alembic downgrade base` to wipe all tables.
  3. Runs `alembic upgrade head` to recreate schema.
  4. Runs the seed registry to populate demo data.
"""

import os
import sys
import subprocess
import logging

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


def reset_and_seed():
    env = os.getenv("ENV", "development")
    if env != "development":
        logger.error(
            f"REFUSING to reset: ENV is '{env}', not 'development'.\n"
            "This script is only safe for development environments."
        )
        sys.exit(1)

    logger.info("=" * 60)
    logger.info("PRAVAH Reset & Seed (development only)")
    logger.info("=" * 60)

    # Step 1: Downgrade
    logger.info("\n[1/3] Downgrading database (alembic downgrade base)...")
    result = subprocess.run(
        ["alembic", "downgrade", "base"],
        cwd=os.path.join(os.path.dirname(__file__), "..", ".."),
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        logger.error(f"Downgrade failed:\n{result.stderr}")
        sys.exit(1)
    logger.info("Downgrade complete.")

    # Step 2: Upgrade
    logger.info("\n[2/3] Upgrading database (alembic upgrade head)...")
    result = subprocess.run(
        ["alembic", "upgrade", "head"],
        cwd=os.path.join(os.path.dirname(__file__), "..", ".."),
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        logger.error(f"Upgrade failed:\n{result.stderr}")
        sys.exit(1)
    logger.info("Upgrade complete.")

    # Step 3: Seed
    logger.info("\n[3/3] Running seed framework...")
    from app.seed.seed import run_seeds

    run_seeds()

    logger.info("\n" + "=" * 60)
    logger.info("Reset & Seed complete! Database is fresh.")
    logger.info("=" * 60)


if __name__ == "__main__":
    reset_and_seed()
