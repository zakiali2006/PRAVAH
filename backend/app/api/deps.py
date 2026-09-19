"""
Shared FastAPI dependencies.

Usage:
    from app.api.deps import get_db, get_current_user
"""

from app.core.database import get_db  # noqa: F401

# ---------------------------------------------------------------------------
# Auth dependencies — stubs until Phase 4
# ---------------------------------------------------------------------------

# def get_current_user(...):
#     """Decode JWT and return the active user. Implemented in Phase 4."""
#     ...

# def get_current_active_user(...):
#     """Verify that the user account is active. Implemented in Phase 4."""
#     ...
