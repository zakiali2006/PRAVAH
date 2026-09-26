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
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
