import logging
import textwrap
from typing import List
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.ai.vector_store import store_document_chunks
from app.ai.embeddings import EmbeddingError

logger = logging.getLogger(__name__)


def chunk_document_text(text: str, chunk_size: int = 500) -> List[str]:
    """
    Slices raw document text into manageable chunks.
    Preserves words using textwrap instead of blindly slicing strings.
    """
    if not text:
        return []

    # We replace multiple whitespace/newlines to create clean semantic chunks
    clean_text = " ".join(text.split()).strip()
    if not clean_text:
        return []
    return textwrap.wrap(clean_text, width=chunk_size, break_long_words=False)


def process_document_embeddings(db: Session, document_id: int, raw_text: str):
    """
    Phase 7: Vectorize Engine (Direct session execution).
    Orchestrates chunking the text and storing the embeddings via Kajal's module.
    """
    chunks = chunk_document_text(raw_text)
    if chunks:
        try:
            store_document_chunks(db, document_id, chunks)
        except EmbeddingError as emb_err:
            logger.error(
                "Embedding generation failed for document %d: %s. Chunks not stored.",
                document_id,
                emb_err,
            )
        except Exception as exc:
            logger.error("Failed to store chunks for document %d: %s", document_id, exc)


def process_document_embeddings_task(document_id: int, raw_text: str):
    """
    Safe Background Task Entrypoint.
    Creates and closes its own independent database session using SessionLocal,
    preventing stale/closed session errors when run asynchronously in FastAPI BackgroundTasks.
    """
    logger.info("Starting background vectorization task for document %d", document_id)
    db = SessionLocal()
    try:
        chunks = chunk_document_text(raw_text)
        if chunks:
            store_document_chunks(db, document_id, chunks)
            logger.info(
                "Background vectorization completed for document %d (%d chunks)",
                document_id,
                len(chunks),
            )
        else:
            logger.warning(
                "No text extracted to vectorize for document %d", document_id
            )
    except EmbeddingError as emb_err:
        logger.error(
            "Background embedding generation failed for document %d: %s",
            document_id,
            emb_err,
        )
    except Exception as exc:
        logger.error(
            "Background task error processing document %d: %s", document_id, exc
        )
    finally:
        db.close()
