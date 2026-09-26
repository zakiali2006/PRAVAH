from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class ServiceBase(BaseModel):
    code: str
    title: str
    department: str
    sub_department: Optional[str] = None
    description: str
    category: str = "Pre-Establishment"
    timeline_days: int = 15
    fee_inr: float = 5000.0
    documents_required: Optional[List[str]] = []
    is_active: bool = True


class ServiceResponse(ServiceBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
