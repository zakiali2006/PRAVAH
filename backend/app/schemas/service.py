from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ServiceBase(BaseModel):
    service_id: str
    name: str
    department: str
    fee: float
    status: str


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    fee: Optional[float] = None
    status: Optional[str] = None


class ServiceOut(ServiceBase):
    id: int
    service_id: Optional[str] = None
    name: Optional[str] = "Unknown"
    department: Optional[str] = None
    fee: Optional[float] = 0.0
    status: Optional[str] = "active"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
