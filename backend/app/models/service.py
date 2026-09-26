from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(String, unique=True, index=True) # e.g. SRV-001
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    fee = Column(Float, default=0.0)
    status = Column(String, default="draft") # draft, active, inactive
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
