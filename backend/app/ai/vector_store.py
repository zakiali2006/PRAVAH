import logging
import math
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.document_chunk import DocumentChunk
from app.models.document import Document, DocumentType
from app.ai.embeddings import generate_embeddings, EmbeddingError

logger = logging.getLogger(__name__)

# Default similarity threshold:
# For normalized embeddings, cosine distance = 1 - cosine_similarity.
# Distance 0.0 = identical, 1.0 = orthogonal, >1.0 = opposite.
# A distance <= 0.65 corresponds to cosine similarity >= 0.35, filtering out irrelevant chunks.
DEFAULT_MAX_DISTANCE = 0.65
MAX_RETRIEVAL_LIMIT = 20


@dataclass
class RetrievedChunk:
    """Represents a retrieved, authorized document chunk with verified metadata."""

    chunk_id: int
    document_id: int
    chunk_index: int
    content: str
    filename: str
    original_name: str
    document_type: Optional[str]
    distance: float
    similarity: float


def store_document_chunks(db: Session, document_id: int, chunks: List[str]) -> int:
    """
    Kajal's Module: Vector Store
    Generates semantic embeddings and stores document chunks in pgvector.

    Returns the number of chunks successfully stored.
    Raises EmbeddingError if embedding generation fails (prevents storing corrupted or random data).
    """
    if not chunks:
        return 0

    # Ensure document exists before storing chunks
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        logger.error("Cannot store chunks: Document ID %s does not exist.", document_id)
        raise ValueError(f"Document with ID {document_id} does not exist.")

    # Generate embeddings — raises EmbeddingError on failure without silent fallback
    embeddings = generate_embeddings(chunks)
    if len(embeddings) != len(chunks):
        raise EmbeddingError(
            f"Embedding count mismatch: expected {len(chunks)}, got {len(embeddings)}"
        )

    db_chunks = []
    for idx, (chunk_text, embedding) in enumerate(zip(chunks, embeddings)):
        db_chunk = DocumentChunk(
            document_id=document_id,
            chunk_index=idx,
            content=chunk_text,
            embedding=embedding,
        )
        db_chunks.append(db_chunk)

    db.add_all(db_chunks)
    db.commit()
    logger.info(
        "Successfully stored %d vector chunks for document %d.",
        len(db_chunks),
        document_id,
    )
    return len(db_chunks)


def _python_cosine_distance(v1: List[float], v2: List[float]) -> float:
    """Helper for calculating cosine distance in non-pgvector environments (e.g. SQLite unit tests)."""
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0 or norm2 == 0:
        return 1.0
    cosine_sim = dot / (norm1 * norm2)
    # Clamp cosine similarity to [-1.0, 1.0] to avoid floating point precision issues
    cosine_sim = max(-1.0, min(1.0, cosine_sim))
    return 1.0 - cosine_sim


def search_similar_chunks(
    db: Session,
    query: str,
    user_id: int,
    limit: int = 5,
    max_distance: float = DEFAULT_MAX_DISTANCE,
) -> List[RetrievedChunk]:
    """
    Performs secure semantic similarity search strictly filtered by user document ownership.

    Security & Retrieval Guarantees:
    1. SQL-level join enforcing `Document.uploader_id == user_id`. Chunks belonging to
       other users are never inspected or returned.
    2. Uses pgvector cosine distance (`<=>`) on PostgreSQL.
    3. Rejects chunks exceeding `max_distance` to avoid hallucinating on irrelevant data.
    4. Bounded top-k retrieval (clamped between 1 and MAX_RETRIEVAL_LIMIT).
    5. Returns genuine document metadata without fabricating fields.
    """
    if not query or not query.strip():
        return []

    # Bound limit
    bounded_limit = min(max(limit, 1), MAX_RETRIEVAL_LIMIT)

    # Generate query embedding
    query_embeddings = generate_embeddings([query.strip()])
    if not query_embeddings:
        return []
    query_vector = query_embeddings[0]

    # Detect SQLite dialect (used in test runner) vs PostgreSQL (pgvector in production)
    dialect_name = db.bind.dialect.name if db.bind else "postgresql"

    results: List[RetrievedChunk] = []

    if dialect_name == "sqlite":
        # SQLite compatibility fallback for unit test suite:
        # Perform user-isolated join in SQL, calculate cosine distance in Python
        raw_rows = (
            db.query(
                DocumentChunk,
                Document.filename,
                Document.original_name,
                DocumentType.name.label("doc_type_name"),
            )
            .join(Document, DocumentChunk.document_id == Document.id)
            .outerjoin(DocumentType, Document.document_type_id == DocumentType.id)
            .filter(Document.uploader_id == user_id)
            .all()
        )

        scored_rows = []
        for chunk, filename, orig_name, doc_type_name in raw_rows:
            dist = _python_cosine_distance(chunk.embedding, query_vector)
            if dist <= max_distance:
                scored_rows.append((dist, chunk, filename, orig_name, doc_type_name))

        scored_rows.sort(key=lambda x: x[0])
        for dist, chunk, filename, orig_name, doc_type_name in scored_rows[
            :bounded_limit
        ]:
            similarity = round(max(0.0, 1.0 - dist), 4)
            results.append(
                RetrievedChunk(
                    chunk_id=chunk.id,
                    document_id=chunk.document_id,
                    chunk_index=chunk.chunk_index,
                    content=chunk.content,
                    filename=orig_name or filename or "document",
                    original_name=orig_name or filename or "document",
                    document_type=doc_type_name,
                    distance=round(dist, 4),
                    similarity=similarity,
                )
            )
        return results

    # PostgreSQL with native pgvector:
    # SQL query enforces:
    # - Join on Document.id
    # - Document.uploader_id == user_id
    # - Cosine distance operator <=>
    # - Cosine distance threshold filter
    try:
        distance_col = DocumentChunk.embedding.cosine_distance(query_vector).label(
            "distance"
        )
        query_stmt = (
            db.query(
                DocumentChunk,
                Document.filename,
                Document.original_name,
                DocumentType.name.label("doc_type_name"),
                distance_col,
            )
            .join(Document, DocumentChunk.document_id == Document.id)
            .outerjoin(DocumentType, Document.document_type_id == DocumentType.id)
            .filter(Document.uploader_id == user_id)
            .filter(distance_col <= max_distance)
            .order_by(distance_col.asc())
            .limit(bounded_limit)
        )

        rows = query_stmt.all()
        for chunk, filename, orig_name, doc_type_name, dist in rows:
            similarity = round(max(0.0, 1.0 - float(dist)), 4)
            results.append(
                RetrievedChunk(
                    chunk_id=chunk.id,
                    document_id=chunk.document_id,
                    chunk_index=chunk.chunk_index,
                    content=chunk.content,
                    filename=orig_name or filename or "document",
                    original_name=orig_name or filename or "document",
                    document_type=doc_type_name,
                    distance=round(float(dist), 4),
                    similarity=similarity,
                )
            )
        return results

    except Exception as exc:
        logger.error("pgvector search query failed: %s", exc)
        raise
