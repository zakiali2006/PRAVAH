import logging
from typing import List
from google import genai
from app.core.config import settings

logger = logging.getLogger(__name__)

# Standard Gemini embedding model (768-dimensional vectors)
EMBEDDING_MODEL = "text-embedding-004"
EMBEDDING_DIMENSION = 768


class EmbeddingError(Exception):
    """Raised when text embedding generation fails."""

    pass


def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Kajal's Module: AI Embeddings
    Generates 768-dimensional semantic embeddings using Google Gemini text-embedding-004.

    Strict reliability guarantees:
    - Never generates or stores random vectors.
    - If API key is missing or invalid, raises EmbeddingError with server-side logging.
    - Returns exact float list per text chunk.
    """
    if not texts:
        return []

    # Clean and filter texts
    cleaned_texts = [t.strip() for t in texts if t and t.strip()]
    if not cleaned_texts:
        return []

    if not settings.GEMINI_API_KEY:
        logger.error("Embedding generation failed: GEMINI_API_KEY is not configured.")
        raise EmbeddingError(
            "AI embedding service is unconfigured. Please set GEMINI_API_KEY."
        )

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=cleaned_texts,
        )

        embeddings: List[List[float]] = []
        if hasattr(response, "embeddings") and response.embeddings:
            for emb in response.embeddings:
                values = list(emb.values)
                if len(values) != EMBEDDING_DIMENSION:
                    logger.warning(
                        "Embedding dimension mismatch: expected %d, got %d",
                        EMBEDDING_DIMENSION,
                        len(values),
                    )
                embeddings.append(values)
            return embeddings

        # Fallback inspection for alternative response structure
        if hasattr(response, "embedding") and response.embedding:
            return [list(response.embedding.values)]

        raise EmbeddingError(
            "Gemini API returned an empty or unrecognized embedding response."
        )

    except EmbeddingError:
        raise
    except Exception as exc:
        # Secure logging: do not leak credentials or full raw payloads
        logger.error("Gemini embedding API call failed: %s", exc)
        raise EmbeddingError(f"Failed to generate text embeddings: {str(exc)}") from exc
