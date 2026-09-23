import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.schemas import ChatRequest
from app.ai.rag_service import rag_service
from app.core.responses import success_response, error_response, ErrorCode

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("", response_model=dict)
@router.post("/", response_model=dict)
def chat_assistant(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Kajal's Module: Authenticated RAG Query Assistant.

    Retrieves semantically relevant chunks from the authenticated user's uploaded documents
    using pgvector and generates grounded, factual answers using Google Gemini.

    Endpoint: POST /api/chat
    Requires: Bearer JWT Token in Authorization header.
    """
    clean_message = request.message.strip()
    if not clean_message:
        return error_response(
            ErrorCode.BAD_REQUEST,
            "Message cannot be empty.",
            status_code=400,
        )

    try:
        rag_result = rag_service.answer_query(
            db=db,
            user_id=current_user.id,
            question=clean_message,
        )

        return success_response(
            data=rag_result,
            message="Query answered successfully",
        )

    except Exception as exc:
        logger.error("Error in chat_assistant endpoint: %s", exc)
        return error_response(
            ErrorCode.INTERNAL_ERROR,
            "An error occurred while processing your request. Please try again.",
            status_code=500,
        )
