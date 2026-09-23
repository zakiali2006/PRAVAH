from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class CAFForm(Base):
    __tablename__ = "caf_forms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    wizard_run_id = Column(Integer, ForeignKey("wizard_runs.id"), nullable=True)
    data = Column(JSON, nullable=False, default={})
    status = Column(String, nullable=False, default="DRAFT")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="caf_forms")
    wizard_run = relationship("WizardRun")
    services = relationship(
        "CAFService", back_populates="caf_form", cascade="all, delete-orphan"
    )


class CAFService(Base):
    __tablename__ = "caf_services"

    id = Column(Integer, primary_key=True, index=True)
    caf_form_id = Column(Integer, ForeignKey("caf_forms.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)

    caf_form = relationship("CAFForm", back_populates="services")
    service = relationship("Service")
