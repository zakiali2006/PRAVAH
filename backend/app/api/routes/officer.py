from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.application import Application
from app.api.routes.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/queue")
def get_officer_queue(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Sort by AI score descending (highest risk first), then urgency
    applications = db.query(Application).filter(Application.status != "approved").order_by(Application.ai_score.desc()).all()
    
    return [
        {
            "id": app.id,
            "service_name": app.service_name,
            "applicant_name": app.applicant_name,
            "status": app.status,
            "urgency": app.urgency,
            "ai_score": app.ai_score,
            "submitted_at": app.submitted_at
        }
        for app in applications
    ]
