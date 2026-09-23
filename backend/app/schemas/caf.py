from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from datetime import datetime


class CAFFormCreate(BaseModel):
    data: Dict[str, Any]
    service_ids: List[int] = []


class CAFServiceOut(BaseModel):
    id: int
    caf_form_id: int
    service_id: int

    class Config:
        from_attributes = True


class CAFFormOut(BaseModel):
    id: int
    user_id: int
    wizard_run_id: Optional[int] = None
    data: Dict[str, Any]
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
