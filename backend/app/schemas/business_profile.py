from typing import Optional
from pydantic import BaseModel, Field


class BusinessProfileBase(BaseModel):
    company_name: str = Field(..., description="Legal name of the company")
    industry: Optional[str] = Field(None, description="Industry sector")
    pan_number: Optional[str] = Field(None, description="PAN number")
    gstin: Optional[str] = Field(None, description="GSTIN number")
    district: Optional[str] = Field(None, description="District of operations")
    investment_value: Optional[str] = Field(
        None, description="Proposed or current investment value"
    )
    employment_count: Optional[int] = Field(None, description="Number of employees")
    designation: Optional[str] = Field(
        None, description="Designation of the contact person"
    )


class BusinessProfileCreate(BusinessProfileBase):
    pass


class BusinessProfileUpdate(BusinessProfileBase):
    company_name: Optional[str] = Field(None, description="Legal name of the company")


class BusinessProfileOut(BusinessProfileBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
        from_attributes = True
