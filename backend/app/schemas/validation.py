from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class ValidationStatus(str, Enum):
    VALID = "VALID"
    WARNING = "WARNING"
    INVALID = "INVALID"


class FieldMismatch(BaseModel):
    field: str
    expected: Optional[str] = None
    extracted: Optional[str] = None
    reason: str


class ValidationResult(BaseModel):
    """
    Standardized schema for Document validation results.
    Preserves backward compatibility while adding rich mismatch and confidence telemetry.
    """

    status: ValidationStatus
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    matches: List[str] = Field(default_factory=list)
    mismatches: List[FieldMismatch] = Field(default_factory=list)
    reasons: List[str] = Field(default_factory=list)
