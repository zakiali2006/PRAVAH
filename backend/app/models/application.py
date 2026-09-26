from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, index=True)  # e.g. MTR/2026/001
    user_id = Column(Integer, ForeignKey("users.id"))
    business_id = Column(Integer, ForeignKey("business_profiles.id"), nullable=True)
    factory_unit_id = Column(Integer, ForeignKey("factory_units.id"), nullable=True)
    assigned_officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    service_name = Column(String, nullable=False)
    service_code = Column(String, nullable=True)
    applicant_name = Column(String, nullable=False)
    status = Column(String, default="draft")  # draft, submitted, pending, scrutiny, clarification, approved, rejected
    is_draft = Column(Boolean, default=True)

    # Priority for AI workload balancer
    urgency = Column(String, default="normal")  # normal, high, critical
    ai_score = Column(Float, default=0.0)
    fee_amount = Column(Float, default=0.0)
    caf_data = Column(JSON, nullable=True)

    submitted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    stages = relationship(
        "Stage",
        back_populates="application",
        cascade="all, delete",
        order_by="Stage.id",
    )
    risk_score = relationship(
        "ApplicationRiskScore",
        back_populates="application",
        uselist=False,
        cascade="all, delete-orphan",
    )
    factory_unit = relationship("FactoryUnit", foreign_keys=[factory_unit_id])
    application_documents = relationship("ApplicationDocument", back_populates="application", cascade="all, delete-orphan")
