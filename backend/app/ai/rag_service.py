import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from google import genai
from google.genai import types

from app.core.config import settings
from app.ai.vector_store import search_similar_chunks, RetrievedChunk
from app.ai.prompts.query_assistant import format_rag_prompt
from app.ai.embeddings import EmbeddingError

logger = logging.getLogger(__name__)

MAX_QUESTION_LENGTH = 1000
MAX_CONTEXT_CHARS = 4000


class RAGService:
    """
    Kajal's Module: Complete RAG Pipeline for PRAVAH.

    Retrieves authorized, semantically relevant document chunks for the
    authenticated user and generates grounded answers via Gemini LLM.
    """

    def __init__(self):
        self.model_name = (
            settings.AI_MODEL_TEXT if settings.AI_MODEL_TEXT else "gemini-1.5-flash"
        )

    def answer_query(
        self,
        db: Session,
        user_id: int,
        question: str,
        limit: int = 5,
    ) -> Dict[str, Any]:
        """
        Executes the end-to-end RAG workflow:
        1. Validates and normalizes user question.
        2. Retrieves authorized chunks belonging to `user_id` above the relevance threshold.
        3. Constructs bounded context with untrusted boundary delimiters.
        4. Calls Gemini with low temperature for factual grounded answers.
        5. Returns structured answer and verified source citations.
        """
        # 1. Validate and normalize question
        if not question or not question.strip():
            return {
                "reply": "Please enter a valid question regarding your uploaded documents.",
                "sources": [],
            }

        clean_question = question.strip()
        if len(clean_question) > MAX_QUESTION_LENGTH:
            clean_question = clean_question[:MAX_QUESTION_LENGTH]

        # 2. Retrieve authorized document chunks
        try:
            retrieved_chunks = search_similar_chunks(
                db=db,
                query=clean_question,
                user_id=user_id,
                limit=limit,
            )
        except EmbeddingError as emb_err:
            logger.error("RAG search failed due to embedding error: %s", emb_err)
            return {
                "reply": "The AI embedding service is currently unavailable. Please ensure GEMINI_API_KEY is configured properly.",
                "sources": [],
            }
        except Exception as exc:
            logger.error("Vector search failed unexpectedly: %s", exc)
            return {
                "reply": "Unable to search uploaded documents at this time due to an internal error.",
                "sources": [],
            }

        # 3. Handle no-context case safely without forcing hallucinations
        if not retrieved_chunks:
            return {
                "reply": (
                    "I could not find any relevant information in your uploaded documents. "
                    "Please ensure you have uploaded the relevant business certificates or "
                    "approvals, and that they have been processed."
                ),
                "sources": [],
            }

        # 4. Build bounded context
        context_parts = []
        current_len = 0
        used_chunks: List[RetrievedChunk] = []

        for chunk in retrieved_chunks:
            chunk_header = f"[Document: {chunk.filename}, Chunk: {chunk.chunk_index}]"
            chunk_entry = f"{chunk_header}\n{chunk.content}\n"
            if current_len + len(chunk_entry) > MAX_CONTEXT_CHARS and used_chunks:
                break
            context_parts.append(chunk_entry)
            current_len += len(chunk_entry)
            used_chunks.append(chunk)

        context_text = "\n---\n".join(context_parts)

        # 5. Build prompt
        prompt = format_rag_prompt(
            retrieved_chunks_text=context_text,
            user_question=clean_question,
        )

        # 6. Call Gemini LLM (backend-only, no API keys sent to frontend)
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY missing when generating RAG answer.")
            return {
                "reply": (
                    "AI generation service is not configured (GEMINI_API_KEY missing). "
                    "However, relevant document chunks were found in your repository."
                ),
                "sources": [
                    {
                        "document_id": c.document_id,
                        "filename": c.filename,
                        "chunk_index": c.chunk_index,
                        "document_type": c.document_type,
                        "similarity": c.similarity,
                    }
                    for c in used_chunks
                ],
            }

        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            response = client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2,  # Low temperature for factual precision
                    max_output_tokens=settings.MAX_TOKENS or 1000,
                ),
            )

            reply_text = (
                response.text.strip()
                if response.text
                else "Unable to generate an answer."
            )

        except Exception as exc:
            logger.error("Gemini content generation failed: %s", exc)
            return {
                "reply": "An error occurred while generating the answer. Please try again later.",
                "sources": [],
            }

        # 7. Format actual source citations
        unique_sources = []
        seen_keys = set()
        for c in used_chunks:
            key = (c.document_id, c.chunk_index)
            if key not in seen_keys:
                seen_keys.add(key)
                unique_sources.append(
                    {
                        "document_id": c.document_id,
                        "filename": c.filename,
                        "chunk_index": c.chunk_index,
                        "document_type": c.document_type,
                        "similarity": c.similarity,
                    }
                )

        return {
            "reply": reply_text,
            "sources": unique_sources,
        }


rag_service = RAGService()
