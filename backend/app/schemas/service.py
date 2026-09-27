
from pydantic import BaseModel, model_validator
from typing import Optional, Any
from datetime import datetime


class ServiceBase(BaseModel):
    service_id: Optional[str] = None
    code: Optional[str] = None
    name: str
    department: Optional[str] = None
    department_id: Optional[int] = None
    fee: Optional[float] = 0.0
    fee_amount: Optional[float] = 0.0
    processing_time_days: Optional[int] = None
    sector: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "active"

    @model_validator(mode="after")
    def populate_legacy_fields(self):
        if not self.service_id:
            self.service_id = self.code
        if self.fee is None or self.fee == 0.0:
            self.fee = self.fee_amount or 0.0
        if not self.department:
            self.department = "Gov"
        return self


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    fee: Optional[float] = None
    status: Optional[str] = None


class ServiceOut(ServiceBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
