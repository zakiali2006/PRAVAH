from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.api.deps import get_current_user, RoleChecker
from app.schemas.grievance import GrievanceCreate, GrievanceResponse, GrievanceClose
from app.services.grievance_service import grievance_service
from typing import List

router = APIRouter()
allow_officers = RoleChecker(["OFFICER", "SYSTEM_ADMIN"])


@router.post("/", response_model=GrievanceResponse)
def submit_grievance(
    data: GrievanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a new grievance (any authenticated user)."""
    grievance = grievance_service.create(db, data, user_id=current_user.id)
    return grievance


@router.get("/", response_model=List[GrievanceResponse])
def list_grievances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: bool = Depends(allow_officers),
):
    """List all grievances (officers only)."""
    return grievance_service.get_all(db)


@router.get("/{grievance_id}", response_model=GrievanceResponse)
def get_grievance(
    grievance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific grievance by ID."""
    grievance = grievance_service.get_by_id(db, grievance_id)
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")
    return grievance


@router.post("/{grievance_id}/close", response_model=GrievanceResponse)
def close_grievance(
    grievance_id: int,
    data: GrievanceClose,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: bool = Depends(allow_officers),
):
    """Close a grievance (officers only)."""
    grievance = grievance_service.close(db, grievance_id, data, current_user.id)
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")
    return grievance
