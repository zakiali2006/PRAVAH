from pydantic import BaseModel
from typing import List
from enum import Enum


class ValidationStatus(str, Enum):
    VALID = "VALID"
    WARNING = "WARNING"
    INVALID = "INVALID"


class ValidationResult(BaseModel):
    """
    Standardized schema for Document validation results.
    """

    status: ValidationStatus
    reasons: List[str]
