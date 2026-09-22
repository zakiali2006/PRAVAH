from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends,
    Form,
    BackgroundTasks,
)
from sqlalchemy.orm import Session


from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document, DocumentType
from app.schemas.document import (
    DocumentOut,
    DocumentCreate,
    DocumentTypeOut,
    DocumentTypeCreate,
)
from app.core.responses import success_response, error_response, ErrorCode

from app.services.storage_service import storage_service
from app.services.audit_service import audit_service, AuditAction

router = APIRouter()


@router.post("/upload", response_model=dict)
def upload_document(
    file: UploadFile = File(...),
    document_type_id: int = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        # 1. Save and validate file via storage adapter
        # Determine sub-directory for user (e.g. user_id)
        file_path = storage_service.save_file(file, directory=f"user_{current_user.id}")

        # 2. Compute file size (it was seeked to end during validation)
        file.file.seek(0, 2)
        size_bytes = file.file.tell()
        file.file.seek(0)

        # 3. Create DB record
        db_doc = Document(
            filename=file_path.split("/")[-1],
            original_name=file.filename,
            mime_type=file.content_type,
            size_bytes=size_bytes,
            file_path=file_path,
            status="UPLOADED",
            document_type_id=document_type_id,
            uploader_id=current_user.id,
        )

        db.add(db_doc)
        db.flush()  # Flush to get db_doc.id

        # Create audit log per TEAM_HANDOVER.md rules
        audit_service.log(
            db=db,
            actor_id=current_user.id,
            action=AuditAction.DOCUMENT_UPLOAD,
            entity_type="document",
            entity_id=str(db_doc.id),
            after_data={"filename": file.filename, "size": size_bytes},
        )
        db.commit()
        db.refresh(db_doc)

        return success_response(
            DocumentOut.model_validate(db_doc).model_dump(),
            "Document uploaded successfully",
        )
    except HTTPException as e:
        return error_response(ErrorCode.BAD_REQUEST, e.detail, e.status_code)
    except Exception as e:
        return error_response(ErrorCode.INTERNAL_ERROR, f"Upload failed: {str(e)}", 500)


@router.post("/types", response_model=dict)
def create_document_type(
    doc_type: DocumentTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Depending on RBAC, we might want to restrict this to POLICY_ADMIN
    existing = db.query(DocumentType).filter(DocumentType.name == doc_type.name).first()
    if existing:
        return error_response(ErrorCode.CONFLICT, "Document type already exists", 409)

    db_doc_type = DocumentType(**doc_type.model_dump())
    db.add(db_doc_type)
    db.commit()
    db.refresh(db_doc_type)
    return success_response(
        DocumentTypeOut.model_validate(db_doc_type).model_dump(),
        "Document type created",
    )


@router.get("/types", response_model=dict)
def get_document_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    types = db.query(DocumentType).all()
    data = [DocumentTypeOut.model_validate(t).model_dump() for t in types]
    return success_response(data, "Document types retrieved")


@router.post("", response_model=dict)
def create_document_record(
    document: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_doc = Document(**document.model_dump())
    # Ensure uploader is the current user
    if db_doc.uploader_id != current_user.id:
        return error_response(
            ErrorCode.FORBIDDEN, "Cannot create document for another user", 403
        )

    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return success_response(
        DocumentOut.model_validate(db_doc).model_dump(), "Document record created"
    )


@router.get("", response_model=dict)
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    docs = db.query(Document).filter(Document.uploader_id == current_user.id).all()
    data = [DocumentOut.model_validate(d).model_dump() for d in docs]
    return success_response(data, "Documents retrieved")


@router.get("/{document_id}", response_model=dict)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        return error_response(ErrorCode.RESOURCE_NOT_FOUND, "Document not found", 404)
    if doc.uploader_id != current_user.id:
        return error_response(
            ErrorCode.FORBIDDEN, "Not authorized to access this document", 403
        )

    return success_response(
        DocumentOut.model_validate(doc).model_dump(), "Document retrieved"
    )


@router.delete("/{document_id}", response_model=dict)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        return error_response(ErrorCode.RESOURCE_NOT_FOUND, "Document not found", 404)
    if doc.uploader_id != current_user.id:
        return error_response(
            ErrorCode.FORBIDDEN, "Not authorized to delete this document", 403
        )

    db.delete(doc)
    db.commit()
    return success_response(None, "Document deleted successfully")


@router.post("/{document_id}/validate", response_model=dict)
def validate_document(
    document_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        return error_response(ErrorCode.RESOURCE_NOT_FOUND, "Document not found", 404)
    if doc.uploader_id != current_user.id:
        return error_response(
            ErrorCode.FORBIDDEN, "Not authorized to access this document", 403
        )

    doc_type = (
        db.query(DocumentType).filter(DocumentType.id == doc.document_type_id).first()
    )
    doc_type_name = doc_type.name if doc_type else "Unknown Document"

    try:
        from app.engines.ocr_engine import extract_raw_text
        from app.engines.extraction_engine import extract_structured_data
        from app.engines.validation_engine import validate_document_data
        from app.engines.vectorize_engine import process_document_embeddings

        # Phase 4: OCR
        from app.services.storage_service import storage_service

        absolute_file_path = storage_service.get_file_path(doc.file_path)
        raw_text = extract_raw_text(absolute_file_path, doc.mime_type)

        # Phase 5: Extraction
        structured_data = extract_structured_data(raw_text, doc_type_name)

        # Phase 6: Validation
        # TODO: @bhagyesh Dependency: Pull real business name from business_profiles table
        mock_expected_business_name = "Acme Corp"

        validation_result = validate_document_data(
            structured_data, mock_expected_business_name
        )

        # Phase 7: Vectorization (Run in background to avoid blocking API response)
        background_tasks.add_task(process_document_embeddings, db, doc.id, raw_text)

        # Persist status to document record
        doc.status = validation_result.status.value
        db.commit()

        data = {
            "document_id": doc.id,
            "status": validation_result.status.value,
            "reasons": validation_result.reasons,
            "extracted_data": structured_data.model_dump(),
        }
        return success_response(data, "Document validated successfully")
    except Exception as e:
        return error_response(
            ErrorCode.INTERNAL_ERROR, f"Validation pipeline failed: {str(e)}", 500
        )


@router.get("/{document_id}/validation", response_model=dict)
def get_validation_result(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        return error_response(ErrorCode.RESOURCE_NOT_FOUND, "Document not found", 404)
    if doc.uploader_id != current_user.id:
        return error_response(
            ErrorCode.FORBIDDEN, "Not authorized to access this document", 403
        )

    data = {"document_id": doc.id, "status": doc.status}
    return success_response(data, "Validation status retrieved")
