from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseMixin


class DepartmentQuery(Base, BaseMixin):
    __tablename__ = "department_queries"

    query_id = Column(String(50), unique=True, index=True, nullable=False)
    application_id = Column(
        String, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    department = Column(String(100), nullable=False)
    officer_name = Column(String(100), nullable=False)
    query_subject = Column(String(255), nullable=False)
    query_detail = Column(Text, nullable=False)
    status = Column(
        String(50), default="pending_applicant"
    )  # pending_applicant, replied, resolved
    applicant_reply = Column(Text, nullable=True)
    replied_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    application = relationship("Application", foreign_keys=[application_id])
