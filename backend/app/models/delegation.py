from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseMixin


class UserDelegation(Base, BaseMixin):
    __tablename__ = "user_delegations"

    owner_user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    delegate_user_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    delegate_email = Column(String(100), nullable=False)
    delegate_name = Column(String(100), nullable=False)
    role = Column(
        String(50), default="TRANSACTIONAL_USER"
    )  # TRANSACTIONAL_USER, FINANCE_EXECUTIVE, COMPLIANCE_AGENT
    permissions = Column(
        JSON, default=list
    )  # ["applications.read", "documents.upload", ...]
    is_active = Column(Boolean, default=True)

    # Relationships
    owner = relationship("User", foreign_keys=[owner_user_id])
    delegate = relationship("User", foreign_keys=[delegate_user_id])
