from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base
from app.models.base import BaseMixin


class Grievance(Base, BaseMixin):
    """Grievance submitted by an investor or citizen."""
    __tablename__ = "grievances"

    ticket_id = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    department = Column(String, nullable=False)
    issue = Column(Text, nullable=False)
    priority = Column(String, default="normal")  # low, normal, high, critical
    status = Column(String, default="open")  # open, in_progress, resolved, closed
    assigned_officer_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    sentiment = Column(String, nullable=True)  # positive, neutral, negative
    resolution_notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)
