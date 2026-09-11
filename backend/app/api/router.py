from fastapi import APIRouter
from app.api.routes import auth, services, applications, incentives, grievances, dashboard, chat, documents, officer

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(services.router, prefix="/services", tags=["Services"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])
api_router.include_router(incentives.router, prefix="/incentives", tags=["Incentives"])
api_router.include_router(grievances.router, prefix="/grievances", tags=["Grievances"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(officer.router, prefix="/officer", tags=["Officer"])
