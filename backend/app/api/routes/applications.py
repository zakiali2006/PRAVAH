from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.application import Application
from app.models.stage import Stage
from app.models.user import User
from app.api.routes.auth import get_current_user

router = APIRouter()

@router.get("/{application_id}/track")
def track_application(application_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    stages = db.query(Stage).filter(Stage.application_id == application_id).all()
    
    tracking_stages = []
    for s in stages:
        tracking_stages.append({
            "id": s.id,
            "name": s.name,
            "status": s.status,
            "days_taken": s.days,
            "statutory_limit": s.statutory_limit,
            "description": s.desc
        })
        
    return {
        "application_id": app.id,
        "service_name": app.service_name,
        "status": app.status,
        "tracking_stages": tracking_stages
    }
