from sqlalchemy import Column, String, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseMixin


class PublicConsultation(Base, BaseMixin):
    __tablename__ = "public_consultations"

    code = Column(String(50), unique=True, index=True, nullable=False)
    project_title = Column(String(255), nullable=False)
    applicant_name = Column(String(150), nullable=False)
    department = Column(String(100), default="Environment / MPCB")
    eia_summary = Column(Text, nullable=False)
    venue = Column(String(255), nullable=False)
    location = Column(String(100), nullable=False)
    hearing_date = Column(String(50), nullable=False)
    status = Column(String(50), default="Open for Representation")

    # Relationships
    comments = relationship("ConsultationComment", back_populates="consultation", cascade="all, delete-orphan")


class ConsultationComment(Base, BaseMixin):
    __tablename__ = "consultation_comments"

    consultation_id = Column(
        Integer, ForeignKey("public_consultations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    stakeholder_name = Column(String(100), nullable=False)
    comment = Column(Text, nullable=False)

    # Relationships
    consultation = relationship("PublicConsultation", back_populates="comments")
    user = relationship("User", foreign_keys=[user_id])
