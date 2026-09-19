import textwrap
from typing import List
from sqlalchemy.orm import Session
from app.ai.vector_store import store_document_chunks

def chunk_document_text(text: str, chunk_size: int = 500) -> List[str]:
    """
    Slices raw document text into manageable chunks.
    Preserves words using textwrap instead of blindly slicing strings.
    """
    if not text:
        return []
    
    # We replace newlines to prevent weird chunking, then wrap cleanly
    clean_text = text.replace('\n', ' ').strip()
    return textwrap.wrap(clean_text, width=chunk_size, break_long_words=False)


def process_document_embeddings(db: Session, document_id: int, raw_text: str):
    """
    Phase 7: Vectorize Engine
    Orchestrates chunking the text and storing the embeddings via Kajal's module.
    """
    chunks = chunk_document_text(raw_text)
    if chunks:
        store_document_chunks(db, document_id, chunks)
