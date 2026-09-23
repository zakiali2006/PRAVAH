from pydantic import BaseModel, Field
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
    message: str = Field(..., min_length=1, max_length=1000, description="User query for RAG Assistant")


class ChatSource(BaseModel):
    document_id: int
    filename: str
    chunk_index: int
    document_type: Optional[str] = None
    similarity: Optional[float] = None


class ChatResponseData(BaseModel):
    reply: str
    sources: List[ChatSource] = []

