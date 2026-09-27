import logging
from typing import List
from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.schemas.notification import NotificationResponse

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for in-app notifications."""

    @staticmethod
    def get_for_user(db: Session, user_id: int, limit: int = 50) -> List[Notification]:
        return (
            db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> int:
        return (
            db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.is_read == False)
            .count()
        )

    @staticmethod
    def mark_read(db: Session, notification_id: int, user_id: int) -> bool:
        notif = (
            db.query(Notification)
            .filter(Notification.id == notification_id, Notification.user_id == user_id)
            .first()
        )
        if not notif:
            return False
        notif.is_read = True
        db.commit()
        return True

    @staticmethod
    def mark_all_read(db: Session, user_id: int) -> int:
        count = (
            db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.is_read == False)
            .update({"is_read": True})
        )
        db.commit()
        return count

    @staticmethod
    def create(
        db: Session,
        user_id: int,
        title: str,
        message: str,
        category: str = "info",
        link: str = None,
    ) -> Notification:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            category=category,
            link=link,
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif


notification_service = NotificationService()
