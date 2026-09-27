from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(String, unique=True, index=True, nullable=True)  # e.g. SRV-001
    code = Column(String, unique=True, index=True, nullable=True)  # e.g. MIDC-LAN-01
    name = Column(String, nullable=False, unique=True)
    department = Column(String, nullable=True)  # legacy text field
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    description = Column(String, nullable=True)
    fee = Column(Float, default=0.0)  # legacy
    fee_amount = Column(Float, default=0.0)
    processing_time_days = Column(Integer, nullable=True)
    sector = Column(String, nullable=True)  # Pre-Establishment, Pre-Operation
    status = Column(String, default="active")  # draft, active, inactive

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
