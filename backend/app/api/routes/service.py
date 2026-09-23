from typing import Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.responses import success_response
from app.schemas.service import ServiceOut
from app.services.service_service import service_service

router = APIRouter()


@router.get("", response_model=Any)
def list_services(
    department: Optional[str] = Query(None, description="Filter by department name"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get all services, optionally filtered by department or sector.
    """
    services = service_service.get_multi(db, department=department, sector=sector)
    return success_response(
        data=[ServiceOut.model_validate(s).model_dump() for s in services],
        message="Services retrieved successfully.",
    )


@router.get("/{id}", response_model=Any)
def get_service(
    id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific service by ID.
    """
    service = service_service.get(db, id=id)
    return success_response(
        data=ServiceOut.model_validate(service).model_dump(),
        message="Service retrieved successfully.",
    )
