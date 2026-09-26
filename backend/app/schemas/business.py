from pydantic import BaseModel
from typing import Optional, List


# Factory Unit Schemas
class FactoryUnitBase(BaseModel):
    unit_name: str
    category: Optional[str] = None
    operational_status: Optional[str] = None
    midc_area: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None
    plot_number: Optional[str] = None
    survey_number: Optional[str] = None
    power_sanctioned_kva: Optional[int] = None
    water_demand_kl: Optional[int] = None
    built_up_area_sqm: Optional[int] = None


class FactoryUnitCreate(FactoryUnitBase):
    pass


class FactoryUnitResponse(FactoryUnitBase):
    id: int
    business_id: int

    class Config:
        from_attributes = True


# Business Profile Schemas
class BusinessProfileBase(BaseModel):
    company_name: str
    pan_number: str
    cin_number: Optional[str] = None
    industry_sector: str
    registration_type: str
    address: Optional[str] = None


class BusinessProfileCreate(BusinessProfileBase):
    pass


class BusinessProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    cin_number: Optional[str] = None
    industry_sector: Optional[str] = None
    registration_type: Optional[str] = None
    address: Optional[str] = None


class BusinessProfileResponse(BusinessProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
