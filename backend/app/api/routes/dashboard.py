from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.application import Application
from app.models.user import User
from app.api.routes.auth import get_current_user
from sqlalchemy import func

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Calculate stats from DB
    total_apps = db.query(Application).count()
    approved = db.query(Application).filter(Application.status == "approved").count()
    pending = db.query(Application).filter(Application.status == "pending").count()
    
    # "At-Risk" applications (AI Score > 3.0 or urgency critical)
    at_risk = db.query(Application).filter(
        (Application.ai_score > 3.0) | (Application.urgency == "critical")
    ).count()

    stats = [
        {"id": 1, "name": "Total Applications", "value": str(total_apps), "change": "+12%", "trend": "up"},
        {"id": 2, "name": "Pending Verification", "value": str(pending), "change": "-2%", "trend": "down"},
        {"id": 3, "name": "Approved", "value": str(approved), "change": "+24%", "trend": "up"},
        {"id": 4, "name": "At-Risk Applications", "value": str(at_risk), "change": "+1", "trend": "up", "alert": True}
    ]

    # Dummy chart data to maintain visual fidelity for the demo
    monthly_trends = [
      {"month": "Jan", "applications": 45, "approvals": 30},
      {"month": "Feb", "applications": 52, "approvals": 38},
      {"month": "Mar", "applications": 38, "approvals": 42},
      {"month": "Apr", "applications": 65, "approvals": 45},
      {"month": "May", "applications": 48, "approvals": 35},
      {"month": "Jun", "applications": 71, "approvals": 58}
    ]
    
    return {
        "stats": stats,
        "monthly_trends": monthly_trends,
        "region_split": [],
        "sector_investments": []
    }
