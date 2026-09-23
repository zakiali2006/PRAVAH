from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.service import Service
from app.repositories.service_repository import service_repo
from app.core.exceptions import AppException


class ServiceService:
    def get(self, db: Session, id: int) -> Service:
        service = service_repo.get(db, id=id)
        if not service:
            raise AppException(
                status_code=404,
                error_code="RESOURCE_NOT_FOUND",
                message="Service not found.",
            )
        return service

    def get_multi(
        self,
        db: Session,
        department: Optional[str] = None,
        sector: Optional[str] = None,
    ) -> List[Service]:
        return service_repo.get_multi(db, department=department, sector=sector)


service_service = ServiceService()
