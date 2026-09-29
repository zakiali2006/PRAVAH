from sqlalchemy import Column, String, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseMixin


class DocumentType(Base, BaseMixin):
    __tablename__ = "document_types"

    name = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(String(500), nullable=True)

    # Relationships
    documents = relationship("Document", back_populates="document_type")


class Document(Base, BaseMixin):
    __tablename__ = "documents"

    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    file_path = Column(String(1024), nullable=True)  # Will be set during storage phase

    status = Column(
        String(50), nullable=False, default="UPLOADED"
    )  # UPLOADED, PROCESSED, VALIDATED

    # Validation / Extraction (Phase 5/6)
    extracted_data = Column(JSON, nullable=True)
    validation_status = Column(String(50), nullable=True)  # VALID, WARNING, INVALID
    validation_reason = Column(String(1024), nullable=True)

    # Foreign Keys
    document_type_id = Column(Integer, ForeignKey("document_types.id"), nullable=True)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    document_type = relationship("DocumentType", back_populates="documents")
    uploader = relationship("User", foreign_keys=[uploader_id])
    application_links = relationship("ApplicationDocument", back_populates="document")


class ApplicationDocument(Base, BaseMixin):
    __tablename__ = "application_documents"

    application_id = Column(
        String, ForeignKey("applications.id"), nullable=False, index=True
    )
    document_id = Column(
        Integer, ForeignKey("documents.id"), nullable=False, index=True
    )

    # Relationships
    application = relationship("Application", foreign_keys=[application_id])
    document = relationship("Document", back_populates="application_links")
