from sqlalchemy import Column, Integer, String, Float, ForeignKey
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
    gstin = Column(String, nullable=True)
    industry_sector = Column(String, nullable=False)
    registration_type = Column(
        String, nullable=False
    )  # e.g. Private Limited, Proprietorship, Public Limited
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, default="Maharashtra")
    pincode = Column(String, nullable=True)
    authorized_signatory = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)

    # Relationships
    user = relationship("User", backref="business_profile")
    factory_units = relationship("FactoryUnit", back_populates="business", cascade="all, delete-orphan")


class FactoryUnit(Base, BaseMixin):
    __tablename__ = "factory_units"

    business_id = Column(
        Integer, ForeignKey("business_profiles.id", ondelete="CASCADE"), nullable=False
    )
    unit_name = Column(String, nullable=False)
    midc_area = Column(String, nullable=True)
    plot_number = Column(String, nullable=True)
    survey_number = Column(String, nullable=True)
    taluka = Column(String, nullable=True)
    district = Column(String, nullable=False, default="Pune")
    category = Column(String, default="Orange")  # Red, Orange, Green, White
    power_sanctioned_kva = Column(Float, default=1500)
    water_demand_kld = Column(Float, default=50)
    built_up_area_sqm = Column(Float, default=12000)
    land_area_sqm = Column(Float, nullable=True)
    operational_status = Column(
        String, default="Under Construction"
    )  # Under Construction, Operational, Planned
    investment_amount = Column(Float, nullable=True)  # in INR
    employment_count = Column(Integer, nullable=True)

    # For backward-compatibility with earlier fields
    midc_plot_number = Column(String, nullable=True)
    location_district = Column(String, nullable=True)

    # Relationships
    business = relationship("BusinessProfile", back_populates="factory_units")
