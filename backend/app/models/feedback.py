from sqlalchemy import Column, String, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseMixin


class Feedback(Base, BaseMixin):
    __tablename__ = "feedbacks"

    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    applicant_name = Column(String(100), nullable=True)
    service_name = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 to 5
    category = Column(String(100), default="Overall Experience")
    comment = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
