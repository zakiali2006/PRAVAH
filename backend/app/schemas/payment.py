from typing import Optional
from pydantic import BaseModel


class PaymentCreate(BaseModel):
    amount: float
    # Add other fields like method, etc. if needed by frontend, but for mock, amount is enough.


class PaymentOut(BaseModel):
    id: int
    application_id: str
    amount: float
    status: str
    reference_id: Optional[str] = None

    class Config:
        from_attributes = True
