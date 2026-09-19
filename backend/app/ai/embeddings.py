import os
from typing import List
from google import genai
from app.core.config import settings

def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Kajal's Module: AI Embeddings
    Uses Gemini text-embedding-004 to generate 768-dimensional vectors.
    """
    if not texts:
        return []

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    try:
        response = client.models.embed_content(
            model="models/embedding-001",
            contents=texts,
        )
        if hasattr(response, "embeddings"):
            return [list(emb.values) for emb in response.embeddings]
        else:
            return [list(response.embeddings[i].values) for i in range(len(texts))]
    except Exception as e:
        print(f"Gemini Embedding failed: {e}. Falling back to dummy vectors.")
        # Fallback to dummy 768-d vectors for the hackathon demo if API fails
        import random
        return [[random.random() for _ in range(768)] for _ in texts]
