from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base
from app.models.base import BaseMixin


class Notification(Base, BaseMixin):
    """In-app notification for officers and investors."""
    __tablename__ = "notifications"

    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String, default="info")
    # info, sla_risk, sla_breach, application, document, grievance, compliance, regulatory
    link = Column(String, nullable=True)  # optional deep-link path
    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
