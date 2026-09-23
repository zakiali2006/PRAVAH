from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import BaseMixin


class FactoryUnit(Base, BaseMixin):
    __tablename__ = "factory_units"

    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    business_profile_id = Column(
        Integer,
        ForeignKey("business_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    unit_name = Column(String, nullable=False)
    category = Column(String, nullable=True)  # e.g. Red, Orange, Green, White
    power_sanctioned_kva = Column(Float, nullable=True)
    water_demand_kl = Column(Float, nullable=True)
    built_up_area_sqm = Column(Float, nullable=True)
    operational_status = Column(String, nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)

    # Relationships
    user = relationship("User", backref="factory_units")
    business_profile = relationship("BusinessProfile", backref="factory_units")
    midc_plot = relationship(
        "MIDCPlot",
        back_populates="factory_unit",
        uselist=False,
        cascade="all, delete-orphan",
    )


class MIDCPlot(Base, BaseMixin):
    __tablename__ = "midc_plots"

    factory_unit_id = Column(
        Integer,
        ForeignKey("factory_units.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    midc_area = Column(String, nullable=True)
    plot_number = Column(String, nullable=True)
    survey_number = Column(String, nullable=True)
    taluka = Column(String, nullable=True)
    district = Column(String, nullable=True)

    # Relationships
    factory_unit = relationship("FactoryUnit", back_populates="midc_plot")
