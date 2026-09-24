from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import BaseMixin

# Association table for many-to-many relationship between Service and DocumentType
service_documents = Table(
    "service_documents",
    Base.metadata,
    Column(
        "service_id",
        Integer,
        ForeignKey("services.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "document_type_id",
        Integer,
        ForeignKey("document_types.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Service(Base, BaseMixin):
    __tablename__ = "services"

    name = Column(String, unique=True, nullable=False, index=True)
    code = Column(String, unique=True, nullable=True, index=True)
    description = Column(String, nullable=True)
    department_id = Column(
        Integer, ForeignKey("departments.id"), nullable=False, index=True
    )
    sector = Column(String, nullable=True, index=True)
    fee_amount = Column(Float, nullable=False, default=0.0)
    processing_time_days = Column(Integer, nullable=False, default=0)

    # Relationships
    department = relationship("Department")
    required_documents = relationship(
        "DocumentType", secondary=service_documents, backref="services"
    )
