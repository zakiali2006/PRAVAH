from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from app.core.database import get_db
from app.core.responses import success_response
from app.models.service import Service
from app.schemas.service import ServiceResponse

router = APIRouter()


@router.get("", response_model=dict)
def list_services(
    department: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    List all active services in the single-window catalog.
    Supports filtering by department, category, and text search.
    """
    query = db.query(Service).filter(Service.is_active == True)

    if department and department != "------Select----":
        query = query.filter(Service.department.ilike(f"%{department}%"))

    if category:
        query = query.filter(Service.category.ilike(f"%{category}%"))

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Service.title.ilike(search_filter),
                Service.code.ilike(search_filter),
                Service.department.ilike(search_filter),
                Service.description.ilike(search_filter),
            )
        )

    services = query.order_by(Service.id).all()
    data = [ServiceResponse.model_validate(s).model_dump() for s in services]
    return success_response(data=data, message=f"{len(data)} services found")


@router.get("/departments", response_model=dict)
def list_departments(db: Session = Depends(get_db)):
    """List all distinct departments in the catalog."""
    results = db.query(Service.department, Service.sub_department).distinct().all()
    departments = []
    seen = set()
    for dept, sub in results:
        key = (dept, sub)
        if key not in seen:
            seen.add(key)
            departments.append({"dept": dept, "sub": sub or dept})
    return success_response(data=departments)


@router.get("/{code}", response_model=dict)
def get_service_by_code(code: str, db: Session = Depends(get_db)):
    """Get service details by unique statutory code."""
    svc = db.query(Service).filter(Service.code == code).first()
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    return success_response(data=ServiceResponse.model_validate(svc).model_dump())
