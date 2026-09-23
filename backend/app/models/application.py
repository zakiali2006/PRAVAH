from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, index=True)  # e.g. MTR/2026/001
    user_id = Column(Integer, ForeignKey("users.id"))
    business_profile_id = Column(
        Integer, ForeignKey("business_profiles.id"), nullable=False, index=True
    )
    factory_unit_id = Column(
        Integer, ForeignKey("factory_units.id"), nullable=True, index=True
    )
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False, index=True)

    applicant_name = Column(String, nullable=False)
    status = Column(
        String, default="draft"
    )  # draft, pending, in_progress, approved, rejected
    is_draft = Column(Boolean, default=True)

    # Priority for AI workload balancer
    urgency = Column(String, default="normal")  # normal, high, critical
    ai_score = Column(Float, default=0.0)

    submitted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    current_stage_id = Column(Integer, ForeignKey("tracking_stages.id"), nullable=True)

    stages = relationship(
        "Stage",
        back_populates="application",
        cascade="all, delete",
        foreign_keys="[Stage.application_id]",
    )
    current_stage = relationship("Stage", foreign_keys=[current_stage_id])
    business_profile = relationship("BusinessProfile")
    factory_unit = relationship("FactoryUnit")
    service = relationship("Service")
