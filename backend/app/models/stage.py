from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Stage(Base):
    __tablename__ = "tracking_stages"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String, ForeignKey("applications.id"))
    name = Column(String, nullable=False)
    desc = Column(String, nullable=True)
    status = Column(String, default="pending") # pending, in_progress, completed
    days = Column(Integer, default=0)
    statutory_limit = Column(Integer, default=15)
    
    application = relationship("Application", back_populates="stages")
