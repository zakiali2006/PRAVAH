from pydantic import BaseModel
from typing import List, Optional

class IncentiveCalculateRequest(BaseModel):
    investment: float
    sector: str
    taluka_category: str
    employment: int = 0

class GrievanceCreate(BaseModel):
    name: str
    email: str
    department: str
    issue: str

class ChatRequest(BaseModel):
    message: str
