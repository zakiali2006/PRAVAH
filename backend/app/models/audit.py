from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON

from app.core.database import Base
from app.models.base import BaseMixin


class AuditLog(Base, BaseMixin):
    __tablename__ = "audit_logs"

    actor_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    action = Column(String, nullable=False, index=True)
    entity_type = Column(String, nullable=False, index=True)
    entity_id = Column(String, nullable=False, index=True)
    before_data = Column(JSON, nullable=True)
    after_data = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
