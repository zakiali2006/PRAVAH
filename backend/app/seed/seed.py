"""
PRAVAH Seed Framework — Registry-Based Entry Point

Usage:
    python -m app.seed.seed

This module discovers and runs all registered seed modules in order.
It is idempotent: running it twice creates no duplicates.

To add a new seed module:
  1. Create app/seed/seed_<name>.py with a function seed_<name>(db: Session)
  2. Register it in the SEED_REGISTRY below.
"""

import sys
import logging
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
import app.models  # noqa: F401 — ensures all models are loaded

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Seed Registry — add new seed modules here in execution order
# ---------------------------------------------------------------------------
SEED_REGISTRY = [
    ("RBAC (Roles & Permissions)", "app.seed.seed_rbac", "seed_rbac"),
    ("Demo Users", "app.seed.seed_users", "seed_users"),
    ("Departments", "app.seed.seed_departments", "seed_departments"),
    # Other team members add their entries below:
    # ("Applications", "app.seed.seed_applications", "seed_applications"),
    # ("Stages", "app.seed.seed_stages", "seed_stages"),
]


def run_seeds():
    """Execute all registered seed modules in order."""
    db: Session = SessionLocal()
    try:
        logger.info("=" * 60)
        logger.info("PRAVAH Seed Framework")
        logger.info("=" * 60)

        for label, module_path, func_name in SEED_REGISTRY:
            logger.info(f"\n--- Seeding: {label} ---")
            try:
                import importlib

                module = importlib.import_module(module_path)
                seed_func = getattr(module, func_name)
                seed_func(db)
                logger.info(f"[OK] {label}")
            except Exception as e:
                logger.error(f"[FAIL] {label}: {e}")
                db.rollback()
                raise

        logger.info("\n" + "=" * 60)
        logger.info("All seeds completed successfully!")
        logger.info("=" * 60)
    except Exception as e:
        logger.error(f"Seed process failed: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    run_seeds()
