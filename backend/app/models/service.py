from sqlalchemy import Column, String, Integer, Float, Boolean, JSON
from app.core.database import Base
from app.models.base import BaseMixin


class Service(Base, BaseMixin):
    __tablename__ = "services"

    code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False, index=True)
    sub_department = Column(String(150), nullable=True)
    description = Column(String(1000), nullable=False)
    category = Column(
        String(50), default="Pre-Establishment"
    )  # Pre-Establishment, Pre-Operation, Post-Operation, Incentive
    timeline_days = Column(Integer, default=15)  # RTS Act statutory timeline
    fee_inr = Column(Float, default=5000.0)
    documents_required = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
