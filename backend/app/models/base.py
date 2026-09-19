from datetime import datetime
from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.orm import declarative_mixin
from sqlalchemy.sql import func

@declarative_mixin
class TimestampMixin:
    """Provides created_at and updated_at columns."""
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

@declarative_mixin
class BaseMixin(TimestampMixin):
    """Provides id, created_at, and updated_at columns."""
    id = Column(Integer, primary_key=True, index=True)
