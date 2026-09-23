from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import BaseMixin


class BusinessProfile(Base, BaseMixin):
    __tablename__ = "business_profiles"

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    company_name = Column(String, nullable=False)
    industry = Column(String, nullable=True)
    pan_number = Column(String, unique=True, index=True, nullable=True)
    gstin = Column(String, unique=True, index=True, nullable=True)
    district = Column(String, nullable=True)
    investment_value = Column(String, nullable=True)
    employment_count = Column(Integer, nullable=True)
    designation = Column(String, nullable=True)

    # Relationships
    user = relationship("User", backref="business_profile")
