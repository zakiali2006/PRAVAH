from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class WizardRun(Base):
    __tablename__ = "wizard_runs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="wizard_runs")
    results = relationship(
        "WizardResult", back_populates="run", cascade="all, delete-orphan"
    )


class WizardResult(Base):
    __tablename__ = "wizard_results"

    id = Column(Integer, primary_key=True, index=True)
    wizard_run_id = Column(
        Integer, ForeignKey("wizard_runs.id"), nullable=False, unique=True
    )
    answers = Column(
        JSON, nullable=False
    )  # JSONB equivalent in most DBs, SQLAlchemy handles translation

    run = relationship("WizardRun", back_populates="results")
