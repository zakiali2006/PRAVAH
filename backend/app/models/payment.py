from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import BaseMixin


class Payment(Base, BaseMixin):
    __tablename__ = "payments"

    application_id = Column(
        String,
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    amount = Column(Float, nullable=False)
    status = Column(
        String, default="pending", nullable=False
    )  # pending, completed, failed
    reference_id = Column(
        String, unique=True, index=True, nullable=True
    )  # E.g. Txn ID from gateway

    # Relationships
    application = relationship("Application", backref="payments")
