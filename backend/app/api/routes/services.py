from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceOut

router = APIRouter()


@router.get("/", response_model=List[ServiceOut])
def list_services(db: Session = Depends(get_db)):
    """Get all services."""
    services = db.query(Service).all()
    return services


@router.get("/active", response_model=List[ServiceOut])
def list_active_services(db: Session = Depends(get_db)):
    """Get only active services for the investor portal."""
    services = db.query(Service).filter(Service.status == "active").all()
    return services


@router.post("/", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
def create_service(service_in: ServiceCreate, db: Session = Depends(get_db)):
    """Create a new service (Policy Admin)."""
    # Check if service ID already exists
    existing = (
        db.query(Service).filter(Service.service_id == service_in.service_id).first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Service ID already exists")

    new_service = Service(**service_in.model_dump())
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service


@router.put("/{service_id}", response_model=ServiceOut)
def update_service(
    service_id: str, service_in: ServiceUpdate, db: Session = Depends(get_db)
):
    """Update a service."""
    db_service = db.query(Service).filter(Service.service_id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")

    update_data = service_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_service, key, value)

    db.commit()
    db.refresh(db_service)
    return db_service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(service_id: str, db: Session = Depends(get_db)):
    """Delete a service."""
    db_service = db.query(Service).filter(Service.service_id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")

    db.delete(db_service)
    db.commit()
    return None
