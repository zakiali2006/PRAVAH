from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# Factory Unit Schemas
class FactoryUnitBase(BaseModel):
    unit_name: str
    midc_area: Optional[str] = None
    plot_number: Optional[str] = None
    survey_number: Optional[str] = None
    taluka: Optional[str] = None
    district: str = "Pune"
    category: str = "Orange"  # Red, Orange, Green, White
    power_sanctioned_kva: Optional[float] = 1500.0
    water_demand_kld: Optional[float] = 50.0
    built_up_area_sqm: Optional[float] = 12000.0
    land_area_sqm: Optional[float] = None
    operational_status: str = "Under Construction"
    investment_amount: Optional[float] = None
    employment_count: Optional[int] = None

    # Backward compatibility
    midc_plot_number: Optional[str] = None
    location_district: Optional[str] = None


class FactoryUnitCreate(FactoryUnitBase):
    pass


class FactoryUnitUpdate(BaseModel):
    unit_name: Optional[str] = None
    midc_area: Optional[str] = None
    plot_number: Optional[str] = None
    survey_number: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None
    category: Optional[str] = None
    power_sanctioned_kva: Optional[float] = None
    water_demand_kld: Optional[float] = None
    built_up_area_sqm: Optional[float] = None
    land_area_sqm: Optional[float] = None
    operational_status: Optional[str] = None
    investment_amount: Optional[float] = None
    employment_count: Optional[int] = None


class FactoryUnitResponse(FactoryUnitBase):
    id: int
    business_id: int
    created_at: Optional[datetime] = None

    # camelCase convenience properties for frontend
    unitName: Optional[str] = None
    midcArea: Optional[str] = None
    plotNumber: Optional[str] = None
    surveyNumber: Optional[str] = None
    powerSanctionedKva: Optional[float] = None
    waterDemandKl: Optional[float] = None
    builtUpAreaSqM: Optional[float] = None
    operationalStatus: Optional[str] = None

    class Config:
        from_attributes = True


# Business Profile Schemas
class BusinessProfileBase(BaseModel):
    company_name: str
    pan_number: str
    cin_number: Optional[str] = None
    gstin: Optional[str] = None
    industry_sector: str
    registration_type: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = "Maharashtra"
    pincode: Optional[str] = None
    authorized_signatory: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class BusinessProfileCreate(BusinessProfileBase):
    pass


class BusinessProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    cin_number: Optional[str] = None
    gstin: Optional[str] = None
    industry_sector: Optional[str] = None
    registration_type: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    authorized_signatory: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class BusinessProfileResponse(BusinessProfileBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    factory_units: List[FactoryUnitResponse] = []

    class Config:
        from_attributes = True
