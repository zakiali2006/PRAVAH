from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.core.database import Base
from app.models.base import BaseMixin


class DocumentChunk(Base, BaseMixin):
    __tablename__ = "document_chunks"

    document_id = Column(
        Integer,
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chunk_index = Column(Integer, nullable=False)
    content = Column(String, nullable=False)

    # We use 768 dimensions for Gemini text-embedding-004
    embedding = Column(Vector(768), nullable=False)

    # Relationships
    document = relationship("Document", foreign_keys=[document_id])
