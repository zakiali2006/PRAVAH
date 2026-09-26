"""
Central API router for PRAVAH.

All routers are registered here and included in ``main.py`` under
the ``/api`` prefix.
"""

from fastapi import APIRouter

from app.api.routes import (
    health,
    auth,
    audit,
    services,
    applications,
    officer,
    business,
    chat,
    documents,
    dashboard,
    payments,
    queries,
    grievances,
    feedback,
    consultations,
    incentives,
    delegations,
)

api_router = APIRouter()

# Core system
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(audit.router, prefix="/audit", tags=["Audit System"])

# Functional modules (Phase 1)
api_router.include_router(services.router, prefix="/services", tags=["Services"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])
api_router.include_router(officer.router, prefix="/officer", tags=["Officer"])
api_router.include_router(business.router, prefix="/business-profile", tags=["Business"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(queries.router, prefix="/queries", tags=["Queries"])
api_router.include_router(grievances.router, prefix="/grievances", tags=["Grievances"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])
api_router.include_router(consultations.router, prefix="/consultations", tags=["Consultations"])
api_router.include_router(incentives.router, prefix="/incentives", tags=["Incentives"])
api_router.include_router(delegations.router, prefix="/delegations", tags=["Delegations"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
