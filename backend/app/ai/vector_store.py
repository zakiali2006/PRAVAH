from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.document_chunk import DocumentChunk
from app.ai.embeddings import generate_embeddings

def store_document_chunks(db: Session, document_id: int, chunks: List[str]):
    """
    Kajal's Module: Vector Store
    Stores a list of text chunks as pgvector embeddings in the database.
    """
    if not chunks:
        return
        
    embeddings = generate_embeddings(chunks)
    
    db_chunks = []
    for idx, (chunk_text, embedding) in enumerate(zip(chunks, embeddings)):
        db_chunk = DocumentChunk(
            document_id=document_id,
            chunk_index=idx,
            content=chunk_text,
            embedding=embedding
        )
        db_chunks.append(db_chunk)
        
    db.add_all(db_chunks)
    db.commit()


def search_similar_chunks(db: Session, query: str, limit: int = 5) -> List[DocumentChunk]:
    """
    Performs a semantic similarity search across all documents using L2 distance (<->).
    """
    query_embedding = generate_embeddings([query])[0]
    
    # Query using pgvector's <-> operator for L2 distance, ordering by closest
    # In SQLAlchemy with pgvector: DocumentChunk.embedding.l2_distance(query_embedding)
    results = db.query(DocumentChunk).order_by(
        DocumentChunk.embedding.l2_distance(query_embedding)
    ).limit(limit).all()
    
    return results
