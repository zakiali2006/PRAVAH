from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.service import Service


class ServiceRepository:
    def get(self, db: Session, id: int) -> Optional[Service]:
        return db.query(Service).filter(Service.id == id).first()

    def get_multi(
        self,
        db: Session,
        department: Optional[str] = None,
        sector: Optional[str] = None,
    ) -> List[Service]:
        query = db.query(Service)

        if department:
            # We filter by department code or name. Assuming 'department' query param targets the name or code.
            # E.g. query = query.join(Service.department).filter(Department.code == department)
            # We will use name for now, or the caller can pass department_id. Let's assume it passes department name/code.
            from app.models.rbac import Department

            query = query.join(Service.department).filter(Department.name == department)

        if sector:
            query = query.filter(Service.sector == sector)

        return query.all()


service_repo = ServiceRepository()
