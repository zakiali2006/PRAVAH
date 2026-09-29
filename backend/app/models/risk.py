from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.models.base import BaseMixin


class ApplicationRiskScore(Base, BaseMixin):
    __tablename__ = "application_risk_scores"

    application_id = Column(
        String,
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    score = Column(Float, nullable=False, default=0.0)  # 0.0 to 100.0
    risk_level = Column(String(50), nullable=False, default="LOW")  # LOW, MEDIUM, HIGH
    triage_category = Column(
        String(50), nullable=False, default="STANDARD_REVIEW"
    )  # FAST_TRACK, STANDARD_REVIEW, DOCUMENT_REVIEW, HIGH_RISK_REVIEW
    summary = Column(Text, nullable=True)
    factors = Column(
        JSON, nullable=True
    )  # List of {"factor": str, "impact": int, "reason": str}
    calculated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    application = relationship("Application", back_populates="risk_score")
