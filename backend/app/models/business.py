from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseMixin


class BusinessProfile(Base, BaseMixin):
    __tablename__ = "business_profiles"

    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    company_name = Column(String, nullable=False)
    pan_number = Column(String, nullable=False, unique=True)
    cin_number = Column(String, nullable=True)
    industry_sector = Column(String, nullable=False)
    registration_type = Column(
        String, nullable=False
    )  # e.g. Private Limited, Proprietorship
    address = Column(String, nullable=True)


class FactoryUnit(Base, BaseMixin):
    __tablename__ = "factory_units"

    business_id = Column(
        Integer, ForeignKey("business_profiles.id", ondelete="CASCADE"), nullable=False
    )
    unit_name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    operational_status = Column(String, nullable=True)

    # Location
    midc_area = Column(String, nullable=True)
    taluka = Column(String, nullable=True)
    district = Column(String, nullable=True)
    plot_number = Column(String, nullable=True)
    survey_number = Column(String, nullable=True)

    # Technical
    power_sanctioned_kva = Column(Integer, nullable=True)
    water_demand_kl = Column(Integer, nullable=True)
    built_up_area_sqm = Column(Integer, nullable=True)
