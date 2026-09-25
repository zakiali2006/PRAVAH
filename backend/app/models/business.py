from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseMixin

class BusinessProfile(Base, BaseMixin):
    __tablename__ = "business_profiles"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    company_name = Column(String, nullable=False)
    pan_number = Column(String, nullable=False, unique=True)
    cin_number = Column(String, nullable=True)
    industry_sector = Column(String, nullable=False)
    registration_type = Column(String, nullable=False) # e.g. Private Limited, Proprietorship
    address = Column(String, nullable=True)
    
class FactoryUnit(Base, BaseMixin):
    __tablename__ = "factory_units"

    business_id = Column(Integer, ForeignKey("business_profiles.id", ondelete="CASCADE"), nullable=False)
    unit_name = Column(String, nullable=False)
    midc_plot_number = Column(String, nullable=True)
    location_district = Column(String, nullable=False)
    investment_amount = Column(Integer, nullable=True) # in INR
    employment_count = Column(Integer, nullable=True)
