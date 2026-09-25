from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.api.deps import get_current_user, RoleChecker
from app.schemas.application import ApplicationStatusUpdate, ApplicationResponse
from app.services.application_service import ApplicationService
from app.repositories.application_repo import application_repo
from typing import List

router = APIRouter()
allow_officers = RoleChecker(["OFFICER", "SYSTEM_ADMIN"])

@router.get("/queue", response_model=List[ApplicationResponse])
def get_officer_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: bool = Depends(allow_officers)
):
    # Get applications assigned to this officer
    return application_repo.get_pending_for_officer(db, current_user.id)

@router.post("/applications/{application_id:path}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: str,
    status_update: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: bool = Depends(allow_officers)
):
    return ApplicationService.update_status(db, application_id, status_update, current_user.id)
