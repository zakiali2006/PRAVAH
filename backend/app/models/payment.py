from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseMixin


class Payment(Base, BaseMixin):
    __tablename__ = "payments"

    challan_number = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    application_id = Column(
        String, ForeignKey("applications.id", ondelete="SET NULL"), nullable=True, index=True
    )
    service_name = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(50), default="PENDING")  # PENDING, PAID, FAILED
    payment_mode = Column(String(50), default="NetBanking")
    transaction_ref = Column(String(100), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    application = relationship("Application", foreign_keys=[application_id])
