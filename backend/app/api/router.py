"""
Central API router for PRAVAH.

All routers are registered here and included in ``main.py`` under
the ``/api`` prefix.  Other team members add their routers below
without editing ``main.py``.
"""

from fastapi import APIRouter

from app.api.routes import health

api_router = APIRouter()

# ---------------------------------------------------------------------------
# Core routers (Vinayak)
# ---------------------------------------------------------------------------
api_router.include_router(health.router, tags=["Health"])

# ---------------------------------------------------------------------------
# Team member routers — uncomment as they are implemented
# ---------------------------------------------------------------------------
from app.api.routes import (
    auth,
    audit,
)

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(audit.router, prefix="/audit", tags=["Audit System"])

# from app.api.routes import services
# api_router.include_router(services.router, prefix="/services", tags=["Services"])

from app.api.routes import applications, officer, business, chat, documents
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])
api_router.include_router(officer.router, prefix="/officer", tags=["Officer"])
api_router.include_router(business.router, prefix="/business-profile", tags=["Business"])
