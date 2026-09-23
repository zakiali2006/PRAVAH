from typing import List, Optional
from pydantic import BaseModel, Field


class DocumentTypeOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class DepartmentOut(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    department_id: int
    sector: Optional[str] = None
    fee_amount: float
    processing_time_days: int


class ServiceOut(ServiceBase):
    id: int
    department: DepartmentOut
    required_documents: List[DocumentTypeOut] = []

    class Config:
        from_attributes = True
