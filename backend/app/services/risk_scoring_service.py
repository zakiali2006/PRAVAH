import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from google import genai
from google.genai import types

from app.core.config import settings
from app.models.application import Application
from app.models.document import Document, ApplicationDocument
from app.models.business import BusinessProfile
from app.models.risk import ApplicationRiskScore
from app.schemas.risk import RiskAssessmentResponse, RiskFactor

logger = logging.getLogger(__name__)


class RiskScoringService:
    """
    Kajal's Module: AI-Powered Risk Scoring & Smart Triage Service.

    Computes an explainable, deterministic 0–100 application risk score
    grounded in document verification statuses, profile consistency, and
    document completeness. Employs Gemini for contextual officer summaries.
    """

    @staticmethod
    def get_or_calculate_risk(
        db: Session,
        application_id: str,
    ) -> RiskAssessmentResponse:
        """
        Retrieves existing persisted risk assessment, or computes a fresh one if missing.
        """
        risk_record = (
            db.query(ApplicationRiskScore)
            .filter(ApplicationRiskScore.application_id == application_id)
            .first()
        )
        if risk_record:
            raw_factors = risk_record.factors or []
            return RiskAssessmentResponse(
                score=risk_record.score,
                risk_level=risk_record.risk_level,
                triage_category=risk_record.triage_category,
                summary=risk_record.summary,
                factors=[RiskFactor(**f) for f in raw_factors],
                calculated_at=risk_record.calculated_at,
            )
        return RiskScoringService.calculate_risk(db, application_id, persist=True)

    @staticmethod
    def calculate_risk(
        db: Session,
        application_id: str,
        persist: bool = True,
    ) -> RiskAssessmentResponse:
        """
        Calculates and optionally persists the risk score for an application.
        """
        app = db.query(Application).filter(Application.id == application_id).first()
        if not app:
            raise ValueError(f"Application '{application_id}' not found.")

        # 1. Load applicant's BusinessProfile
        profile = None
        if app.business_id:
            profile = (
                db.query(BusinessProfile)
                .filter(BusinessProfile.id == app.business_id)
                .first()
            )
        if not profile and app.user_id:
            profile = (
                db.query(BusinessProfile)
                .filter(BusinessProfile.user_id == app.user_id)
                .first()
            )

        # 2. Load associated documents
        linked_docs = (
            db.query(Document)
            .join(
                ApplicationDocument,
                ApplicationDocument.document_id == Document.id,
            )
            .filter(ApplicationDocument.application_id == application_id)
            .all()
        )
        if not linked_docs and app.user_id:
            linked_docs = (
                db.query(Document).filter(Document.uploader_id == app.user_id).all()
            )

        # 3. Deterministic factor calculation
        factors: List[Dict[str, Any]] = []

        # Check BusinessProfile existence
        if not profile:
            factors.append(
                {
                    "factor": "Business Profile",
                    "impact": 20,
                    "reason": "Investor business profile is incomplete or unlinked.",
                }
            )

        # Check Documents
        if not linked_docs:
            factors.append(
                {
                    "factor": "Document Completeness",
                    "impact": 25,
                    "reason": "No compliance or identity documents submitted for verification.",
                }
            )
        else:
            invalid_count = 0
            warning_count = 0
            mismatch_types_seen = set()

            for doc in linked_docs:
                v_status = (doc.validation_status or "").upper()
                ext_data = doc.extracted_data or {}
                doc_name = doc.original_name or doc.filename or "Document"

                # Check validation status
                if v_status == "INVALID":
                    invalid_count += 1
                    reason_text = (
                        doc.validation_reason
                        or "Document failed official verification checks."
                    )
                    factors.append(
                        {
                            "factor": "Document Verification",
                            "impact": 30,
                            "reason": f"'{doc_name}' is INVALID: {reason_text}",
                        }
                    )
                elif v_status == "WARNING":
                    warning_count += 1
                    reason_text = (
                        doc.validation_reason
                        or "Document verification produced warnings."
                    )
                    factors.append(
                        {
                            "factor": "Document Verification",
                            "impact": 15,
                            "reason": f"'{doc_name}' has WARNING: {reason_text}",
                        }
                    )

                # Check for explicit telemetry mismatches from Feature 1
                telemetry_mismatches = ext_data.get("mismatches", [])
                for mm in telemetry_mismatches:
                    field = mm.get("field", "")
                    if field and field not in mismatch_types_seen:
                        mismatch_types_seen.add(field)
                        if field == "pan_number":
                            factors.append(
                                {
                                    "factor": "Profile Consistency",
                                    "impact": 20,
                                    "reason": f"PAN mismatch detected on '{doc_name}' ({mm.get('extracted')} vs profile {mm.get('expected')}).",
                                }
                            )
                        elif field == "cin_number":
                            factors.append(
                                {
                                    "factor": "Profile Consistency",
                                    "impact": 15,
                                    "reason": f"CIN mismatch detected on '{doc_name}' ({mm.get('extracted')} vs profile {mm.get('expected')}).",
                                }
                            )
                        elif field == "company_name":
                            factors.append(
                                {
                                    "factor": "Profile Consistency",
                                    "impact": 15,
                                    "reason": f"Company name mismatch detected on '{doc_name}' ({mm.get('extracted')} vs profile {mm.get('expected')}).",
                                }
                            )
                        elif field == "address":
                            factors.append(
                                {
                                    "factor": "Profile Consistency",
                                    "impact": 10,
                                    "reason": f"Address inconsistency detected on '{doc_name}'.",
                                }
                            )

                # Check expiry
                is_expired = ext_data.get("is_expired", False)
                if not is_expired and ext_data.get("expiry_date"):
                    try:
                        exp_dt = datetime.strptime(
                            ext_data["expiry_date"], "%Y-%m-%d"
                        ).date()
                        if exp_dt < date.today():
                            is_expired = True
                    except Exception:
                        pass

                if is_expired:
                    factors.append(
                        {
                            "factor": "Document Validity",
                            "impact": 25,
                            "reason": f"'{doc_name}' has expired.",
                        }
                    )

                # Check signature requirement
                if ext_data.get("requires_signature") and not ext_data.get(
                    "has_signature"
                ):
                    factors.append(
                        {
                            "factor": "Document Completeness",
                            "impact": 10,
                            "reason": f"'{doc_name}' is missing mandatory signatory attestation.",
                        }
                    )

        # 4. Score clamping (0 to 100)
        raw_score = sum(f["impact"] for f in factors)
        score = float(max(0.0, min(100.0, raw_score)))

        # 5. Risk level
        if score <= 30.0:
            risk_level = "LOW"
        elif score <= 65.0:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"

        # 6. Smart Triage category
        if score > 65.0:
            triage_category = "HIGH_RISK_REVIEW"
        elif any(f["factor"] in ["Document Verification", "Profile Consistency", "Document Validity"] for f in factors):
            triage_category = "DOCUMENT_REVIEW"
        elif score <= 30.0 and len(factors) == 0:
            triage_category = "FAST_TRACK"
        else:
            triage_category = "STANDARD_REVIEW"

        # 7. Human-readable explanation summary
        summary = RiskScoringService._generate_summary(
            app=app,
            score=score,
            risk_level=risk_level,
            triage_category=triage_category,
            factors=factors,
        )

        # 8. Persistence (if requested)
        if persist:
            risk_record = (
                db.query(ApplicationRiskScore)
                .filter(ApplicationRiskScore.application_id == application_id)
                .first()
            )
            if not risk_record:
                risk_record = ApplicationRiskScore(
                    application_id=application_id,
                    score=score,
                    risk_level=risk_level,
                    triage_category=triage_category,
                    summary=summary,
                    factors=factors,
                )
                db.add(risk_record)
            else:
                risk_record.score = score
                risk_record.risk_level = risk_level
                risk_record.triage_category = triage_category
                risk_record.summary = summary
                risk_record.factors = factors

            # Synchronize with application table fields
            app.ai_score = score
            if score >= 80.0:
                app.urgency = "critical"
            elif score >= 50.0:
                app.urgency = "high"
            else:
                app.urgency = "normal"

            db.commit()
            db.refresh(risk_record)

        return RiskAssessmentResponse(
            score=score,
            risk_level=risk_level,
            triage_category=triage_category,
            summary=summary,
            factors=[RiskFactor(**f) for f in factors],
            calculated_at=datetime.now(),
        )

    @staticmethod
    def _generate_summary(
        app: Application,
        score: float,
        risk_level: str,
        triage_category: str,
        factors: List[Dict[str, Any]],
    ) -> str:
        """
        Generates an executive triage summary using Gemini if available,
        falling back seamlessly to a high-fidelity deterministic summary.
        """
        # Deterministic fallback
        if not factors:
            deterministic_text = (
                f"Application {app.id} demonstrates clean regulatory compliance. "
                "Submitted documentation matches business profile records with zero discrepancies. "
                "Recommended for FAST_TRACK officer processing."
            )
        else:
            primary_reason = factors[0]["reason"]
            deterministic_text = (
                f"Application {app.id} scored {score:.1f}/100 ({risk_level} risk) with "
                f"{len(factors)} flagged concern(s). Primary observation: {primary_reason} "
                f"Categorized for {triage_category}."
            )

        if not settings.GEMINI_API_KEY:
            return deterministic_text

        # Try Gemini for natural language officer brief
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            prompt = (
                "You are an expert GovTech risk triage assistant for Maharashtra Single Window Clearance. "
                "Summarize the following application risk assessment for the reviewing officer in 2 crisp, factual sentences. "
                "Do NOT recommend automatic approval or rejection. State the risk level, triage category, and key factors concisely.\n\n"
                f"Application ID: {app.id}\n"
                f"Service: {app.service_name}\n"
                f"Applicant: {app.applicant_name}\n"
                f"Calculated Score: {score}/100 ({risk_level})\n"
                f"Triage Category: {triage_category}\n"
                f"Risk Factors: {factors}\n"
            )
            response = client.models.generate_content(
                model=settings.AI_MODEL_TEXT or "gemini-3.8-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.0,
                    max_output_tokens=150,
                ),
            )
            if response.text and response.text.strip():
                return response.text.strip()
        except Exception as exc:
            logger.warning("Gemini risk summary generation failed (fallback used): %s", exc)

        return deterministic_text


risk_scoring_service = RiskScoringService()
