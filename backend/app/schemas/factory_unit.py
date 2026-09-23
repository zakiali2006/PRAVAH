from typing import Optional
from pydantic import BaseModel, Field


class MIDCPlotBase(BaseModel):
    midc_area: Optional[str] = None
    plot_number: Optional[str] = None
    survey_number: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None


class MIDCPlotCreate(MIDCPlotBase):
    pass


class MIDCPlotUpdate(MIDCPlotBase):
    pass


class MIDCPlotOut(MIDCPlotBase):
    id: int
    factory_unit_id: int

    class Config:
        from_attributes = True


class FactoryUnitBase(BaseModel):
    unit_name: str = Field(..., description="Name of the factory unit")
    category: Optional[str] = Field(None, description="Red, Orange, Green, White")
    power_sanctioned_kva: Optional[float] = None
    water_demand_kl: Optional[float] = None
    built_up_area_sqm: Optional[float] = None
    operational_status: Optional[str] = None


class FactoryUnitCreate(FactoryUnitBase):
    business_profile_id: int
    midc_plot: Optional[MIDCPlotCreate] = None


class FactoryUnitUpdate(BaseModel):
    unit_name: Optional[str] = None
    category: Optional[str] = None
    power_sanctioned_kva: Optional[float] = None
    water_demand_kl: Optional[float] = None
    built_up_area_sqm: Optional[float] = None
    operational_status: Optional[str] = None
    midc_plot: Optional[MIDCPlotUpdate] = None


class FactoryUnitOut(FactoryUnitBase):
    id: int
    user_id: int
    business_profile_id: int
    midc_plot: Optional[MIDCPlotOut] = None

    class Config:
        from_attributes = True
