from sqlalchemy import Column, String, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseMixin


class Grievance(Base, BaseMixin):
    __tablename__ = "grievances"

    ticket_id = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    department = Column(String(100), nullable=False)
    application_id = Column(String, nullable=True)
    issue_type = Column(String(100), default="General")
    detail = Column(Text, nullable=False)
    status = Column(String(50), default="Open")  # Open, In Progress, Resolved
    resolution_notes = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
