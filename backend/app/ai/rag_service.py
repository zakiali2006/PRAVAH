import logging
import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from google import genai
from google.genai import types

from app.core.config import settings
from app.ai.vector_store import search_similar_chunks, RetrievedChunk
from app.ai.prompts.query_assistant import format_rag_prompt, format_copilot_prompt
from app.ai.embeddings import EmbeddingError
from app.models.application import Application
from app.models.business import BusinessProfile
from app.models.document import Document, ApplicationDocument
from app.models.user import User

logger = logging.getLogger(__name__)

MAX_QUESTION_LENGTH = 1000
MAX_CONTEXT_CHARS = 4000


class RAGService:
    """
    Kajal's Module: Complete RAG Pipeline & Application Copilot for PRAVAH.

    Retrieves authorized, semantically relevant document chunks for the
    authenticated user and combines them with real-time application context,
    document verification outcomes, and risk assessments to generate grounded
    guidance via Gemini LLM.
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
        application_id: Optional[str] = None,
        limit: int = 5,
    ) -> Dict[str, Any]:
        """
        Executes either:
        A. Standard RAG Q&A (when application_id is None)
        B. Application Copilot Q&A (when application_id is provided)
        """
        # 1. Validate and normalize question
        if not question or not question.strip():
            return {
                "reply": "Please enter a valid question regarding your uploaded documents or application.",
                "sources": [],
                "suggestions": [],
            }

        clean_question = question.strip()
        if len(clean_question) > MAX_QUESTION_LENGTH:
            clean_question = clean_question[:MAX_QUESTION_LENGTH]

        # 2. Check if Application Copilot mode is requested
        application_facts_text: Optional[str] = None
        if application_id:
            application_facts_text = self._build_application_facts(
                db=db,
                user_id=user_id,
                application_id=application_id,
            )

        # 3. Retrieve authorized document chunks for user
        retrieved_chunks: List[RetrievedChunk] = []
        try:
            retrieved_chunks = search_similar_chunks(
                db=db,
                query=clean_question,
                user_id=user_id,
                limit=limit,
            )
        except EmbeddingError as emb_err:
            logger.warning("RAG vector search warning (embedding): %s", emb_err)
        except Exception as exc:
            logger.warning("Vector search warning: %s", exc)

        # 4. Handle no-context case for standard RAG mode (when no application context)
        if not application_facts_text and not retrieved_chunks:
            return {
                "reply": (
                    "I could not find any relevant information in your uploaded documents. "
                    "Please ensure you have uploaded the relevant business certificates or "
                    "approvals, and that they have been processed."
                ),
                "sources": [],
                "suggestions": [],
            }

        # 5. Build bounded document context
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

        # 6. Format prompt based on mode
        if application_facts_text:
            prompt = format_copilot_prompt(
                application_facts_text=application_facts_text,
                retrieved_chunks_text=context_text,
                user_question=clean_question,
            )
        else:
            prompt = format_rag_prompt(
                retrieved_chunks_text=context_text,
                user_question=clean_question,
            )

        # 7. Call Gemini LLM
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY missing when generating Copilot/RAG answer.")
            if application_facts_text:
                fallback_reply = (
                    "Application facts loaded successfully. (AI generation is in offline mode due to missing API key). "
                    "Please refer to the application tracking dashboard and verification details modal for official status."
                )
            else:
                fallback_reply = (
                    "AI generation service is not configured (GEMINI_API_KEY missing). "
                    "However, relevant document chunks were found in your repository."
                )
            return {
                "reply": fallback_reply,
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
                "suggestions": [],
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
                "suggestions": [],
            }

        # 8. Extract optional structured form suggestions from Copilot response
        suggestions = self._extract_suggestions(reply_text)

        # 9. Format actual source citations
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
            "application_id": application_id,
            "suggestions": suggestions,
        }

    def _build_application_facts(
        self,
        db: Session,
        user_id: int,
        application_id: str,
    ) -> str:
        """
        Loads and compiles authoritative application, profile, document verification,
        and risk scoring facts with strict authorization checks.
        """
        app = db.query(Application).filter(Application.id == application_id).first()
        if not app:
            raise ValueError(f"Application '{application_id}' not found.")

        # Strict authorization check
        if app.user_id != user_id:
            user = db.query(User).filter(User.id == user_id).first()
            user_role = (
                (getattr(user.role, "name", None) or str(user.role or "")).upper()
                if user
                else ""
            )
            if user_role not in ["OFFICER", "SYSTEM_ADMIN"]:
                raise PermissionError(
                    f"Not authorized to access application '{application_id}'."
                )

        facts: List[str] = [
            f"- Application ID: {app.id}",
            f"- Service Requested: {app.service_name}",
            f"- Applicant Name: {app.applicant_name}",
            f"- Application Status: {app.status}",
            f"- Urgency: {app.urgency}",
            f"- AI Priority Score: {app.ai_score:.1f}/100",
        ]

        # Stages
        if app.stages:
            facts.append("- Application Clearance Stages:")
            for s in app.stages:
                facts.append(
                    f"  * {s.name} [{s.status.upper()}]: {s.desc or 'No additional details'}"
                )

        # Business Profile
        profile = None
        if app.business_id:
            profile = (
                db.query(BusinessProfile)
                .filter(BusinessProfile.id == app.business_id)
                .first()
            )
        if not profile:
            profile = (
                db.query(BusinessProfile)
                .filter(BusinessProfile.user_id == app.user_id)
                .first()
            )

        if profile:
            facts.append("- Registered Business Profile Facts:")
            facts.append(f"  * Company Name: {profile.company_name}")
            facts.append(f"  * PAN Number: {profile.pan_number}")
            facts.append(f"  * CIN Number: {profile.cin_number or 'N/A'}")
            facts.append(f"  * Industry Sector: {profile.industry_sector}")
            facts.append(f"  * Registration Type: {profile.registration_type}")
            if profile.address:
                facts.append(f"  * Registered Office Address: {profile.address}")
        else:
            facts.append("- Business Profile: No business profile linked.")

        # Uploaded Documents & OCR Verification
        docs = (
            db.query(Document)
            .join(
                ApplicationDocument,
                ApplicationDocument.document_id == Document.id,
            )
            .filter(ApplicationDocument.application_id == app.id)
            .all()
        )
        if not docs:
            docs = db.query(Document).filter(Document.uploader_id == app.user_id).all()

        if docs:
            facts.append("- Uploaded Documents & Verification Telemetry:")
            for d in docs:
                status = d.validation_status or d.status
                reason = d.validation_reason or "Verification completed"
                doc_name = d.original_name or d.filename
                facts.append(f"  * '{doc_name}' (Status: {status}): {reason}")
                ext_data = d.extracted_data or {}
                mismatches = ext_data.get("verification", {}).get("mismatches", [])
                if mismatches:
                    for mm in mismatches:
                        facts.append(
                            f"    - Discrepancy: {mm.get('field')} mismatch (document: '{mm.get('extracted')}' vs profile: '{mm.get('expected')}')"
                        )
        else:
            facts.append("- Uploaded Documents: No documents submitted yet.")

        # Risk Assessment & Triage
        try:
            from app.services.risk_scoring_service import risk_scoring_service

            risk_data = risk_scoring_service.get_or_calculate_risk(db, app.id)
            facts.append("- AI Risk Scoring & Smart Triage Assessment:")
            facts.append(f"  * Score: {risk_data.score:.1f}/100")
            facts.append(f"  * Risk Level: {risk_data.risk_level}")
            facts.append(f"  * Smart Triage Category: {risk_data.triage_category}")
            facts.append(f"  * Executive Summary: {risk_data.summary}")
            if risk_data.factors:
                facts.append("  * Flagged Risk Factors:")
                for f in risk_data.factors:
                    facts.append(f"    - [{f.factor}] (+{f.impact} pts): {f.reason}")
        except Exception as exc:
            logger.warning("Could not append risk data to Copilot facts: %s", exc)

        return "\n".join(facts)

    def _extract_suggestions(self, text: str) -> List[Dict[str, str]]:
        """
        Parses structured form suggestions if generated in the format:
        [SUGGESTION: field_name -> suggested_value | Reason: reason]
        """
        pattern = (
            r"\[SUGGESTION:\s*([^->|]+)\s*->\s*([^|]+)\s*\|\s*Reason:\s*([^\]]+)\]"
        )
        matches = re.findall(pattern, text, re.IGNORECASE)
        suggestions = []
        for m in matches:
            suggestions.append(
                {
                    "type": "FORM_SUGGESTION",
                    "field": m[0].strip(),
                    "suggested_value": m[1].strip(),
                    "reason": m[2].strip(),
                }
            )
        return suggestions


rag_service = RAGService()
