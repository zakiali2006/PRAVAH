from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class GrievanceCreate(BaseModel):
    name: str
    email: str
    department: str
    issue: str
    priority: str = "normal"


class GrievanceResponse(BaseModel):
    id: int
    ticket_id: str
    name: str
    email: str
    department: str
    issue: str
    priority: str
    status: str
    assigned_officer_id: Optional[int] = None
    sentiment: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GrievanceClose(BaseModel):
    resolution_notes: str
