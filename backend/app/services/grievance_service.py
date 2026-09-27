import uuid
import logging
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func as sa_func

from app.models.grievance import Grievance
from app.models.notification import Notification
from app.schemas.grievance import GrievanceCreate, GrievanceResponse, GrievanceClose

logger = logging.getLogger(__name__)


class GrievanceService:
    """Service for managing grievances on PostgreSQL."""

    @staticmethod
    def create(db: Session, data: GrievanceCreate, user_id: Optional[int] = None) -> Grievance:
        ticket_id = f"GRV-{str(uuid.uuid4())[:8].upper()}"
        grievance = Grievance(
            ticket_id=ticket_id,
            user_id=user_id,
            name=data.name,
            email=data.email,
            department=data.department,
            issue=data.issue,
            priority=data.priority,
            status="open",
        )
        db.add(grievance)
        db.commit()
        db.refresh(grievance)

        # Create notification for relevant officers
        _notify_officers_grievance(db, grievance)

        return grievance

    @staticmethod
    def get_all(db: Session) -> List[Grievance]:
        return (
            db.query(Grievance)
            .order_by(Grievance.created_at.desc())
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, grievance_id: int) -> Optional[Grievance]:
        return db.query(Grievance).filter(Grievance.id == grievance_id).first()

    @staticmethod
    def get_by_ticket(db: Session, ticket_id: str) -> Optional[Grievance]:
        return db.query(Grievance).filter(Grievance.ticket_id == ticket_id).first()

    @staticmethod
    def close(
        db: Session, grievance_id: int, data: GrievanceClose, officer_id: int
    ) -> Optional[Grievance]:
        grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
        if not grievance:
            return None

        grievance.status = "closed"
        grievance.resolution_notes = data.resolution_notes
        grievance.assigned_officer_id = officer_id
        grievance.closed_at = datetime.utcnow()
        db.commit()
        db.refresh(grievance)
        return grievance


def _notify_officers_grievance(db: Session, grievance: Grievance):
    """Create an in-app notification for all officers about a new grievance."""
    from app.models.user import User

    officers = db.query(User).filter(User.role.in_(["OFFICER", "SYSTEM_ADMIN"])).all()
    for officer in officers:
        notif = Notification(
            user_id=officer.id,
            title="New Grievance Filed",
            message=f"Grievance {grievance.ticket_id} filed for {grievance.department}: {grievance.issue[:80]}...",
            category="grievance",
            link=f"/grievances/{grievance.id}",
        )
        db.add(notif)
    db.commit()


grievance_service = GrievanceService()
