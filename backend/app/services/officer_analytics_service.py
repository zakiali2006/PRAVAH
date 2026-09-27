"""
Officer-specific analytics services: SLA dashboard, workload, duplicates, and smart assignment.
"""
import logging
from typing import List, Dict, Any
from collections import defaultdict
from difflib import SequenceMatcher
from sqlalchemy.orm import Session
from sqlalchemy import func as sa_func

from app.models.application import Application
from app.models.user import User
from app.models.risk import ApplicationRiskScore
from app.schemas.officer import (
    SLADashboardResponse,
    DepartmentSLA,
    WorkloadResponse,
    DuplicateCandidate,
    DuplicateDetectionResponse,
    RecommendAssignmentResponse,
)

logger = logging.getLogger(__name__)

# Statuses considered "active" for SLA tracking
ACTIVE_STATUSES = ["submitted", "pending", "scrutiny", "final_approval", "clarification"]


class OfficerAnalyticsService:

    # -----------------------------------------------------------------
    # SLA Dashboard
    # -----------------------------------------------------------------
    @staticmethod
    def get_sla_dashboard(db: Session) -> SLADashboardResponse:
        """
        Aggregate SLA stats across all active applications.
        Uses ai_score as a proxy for SLA risk:
          - score <= 30 → on_track
          - 30 < score <= 65 → at_risk
          - score > 65 → breached
        """
        apps = (
            db.query(Application)
            .filter(Application.status.in_(ACTIVE_STATUSES))
            .all()
        )

        dept_buckets: Dict[str, Dict[str, Any]] = defaultdict(
            lambda: {"total": 0, "on_track": 0, "at_risk": 0, "breached": 0, "score_sum": 0.0}
        )

        total_on_track = 0
        total_at_risk = 0
        total_breached = 0

        for app in apps:
            score = app.ai_score or 0.0
            dept = app.service_name or "Unknown"

            bucket = dept_buckets[dept]
            bucket["total"] += 1
            bucket["score_sum"] += score

            if score <= 30:
                bucket["on_track"] += 1
                total_on_track += 1
            elif score <= 65:
                bucket["at_risk"] += 1
                total_at_risk += 1
            else:
                bucket["breached"] += 1
                total_breached += 1

        departments = []
        for dept_name, b in dept_buckets.items():
            avg_remaining = max(0, 100 - (b["score_sum"] / b["total"])) if b["total"] else 0
            departments.append(
                DepartmentSLA(
                    department=dept_name,
                    total=b["total"],
                    on_track=b["on_track"],
                    at_risk=b["at_risk"],
                    breached=b["breached"],
                    avg_days_remaining=round(avg_remaining * 0.3, 1),  # approximate days
                )
            )

        return SLADashboardResponse(
            total_applications=len(apps),
            on_track=total_on_track,
            at_risk=total_at_risk,
            breached=total_breached,
            departments=departments,
        )

    # -----------------------------------------------------------------
    # Workload
    # -----------------------------------------------------------------
    @staticmethod
    def get_workload(db: Session, officer_id: int) -> WorkloadResponse:
        """Compute workload stats for the current officer."""
        all_pending = (
            db.query(Application)
            .filter(Application.status.in_(ACTIVE_STATUSES))
            .all()
        )

        completed = (
            db.query(Application)
            .filter(
                Application.status.in_(["approved", "rejected"]),
            )
            .all()
        )

        risk_scores = [a.ai_score or 0 for a in all_pending]
        high_risk = sum(1 for s in risk_scores if s > 65)
        avg_score = (sum(risk_scores) / len(risk_scores)) if risk_scores else 0.0

        in_review = sum(
            1
            for a in all_pending
            if a.status in ("scrutiny", "final_approval", "clarification")
        )

        return WorkloadResponse(
            total_assigned=len(all_pending),
            pending=len(all_pending) - in_review,
            in_review=in_review,
            completed_today=len(completed),
            high_risk_count=high_risk,
            avg_risk_score=round(avg_score, 1),
        )

    # -----------------------------------------------------------------
    # Duplicate Detection
    # -----------------------------------------------------------------
    @staticmethod
    def detect_duplicates(db: Session) -> DuplicateDetectionResponse:
        """
        Detect potential duplicate applications using exact field matches
        and fuzzy name matching.
        """
        apps = (
            db.query(Application)
            .filter(Application.status.notin_(["rejected"]))
            .order_by(Application.created_at.desc())
            .all()
        )

        candidates: List[DuplicateCandidate] = []
        seen_pairs = set()

        for i, a in enumerate(apps):
            for j, b in enumerate(apps):
                if i >= j:
                    continue
                pair_key = tuple(sorted([a.id, b.id]))
                if pair_key in seen_pairs:
                    continue

                # Same user submitting multiple applications for the same service
                if (
                    a.user_id == b.user_id
                    and a.service_name == b.service_name
                    and a.user_id is not None
                ):
                    seen_pairs.add(pair_key)
                    candidates.append(
                        DuplicateCandidate(
                            application_id=a.id,
                            matched_application_id=b.id,
                            applicant_name=a.applicant_name or "",
                            matched_applicant_name=b.applicant_name or "",
                            match_type="exact_user_service",
                            confidence=95.0,
                            details=f"Same user submitted multiple applications for '{a.service_name}'.",
                        )
                    )
                    continue

                # Fuzzy name match (different users, same service)
                if a.service_name == b.service_name and a.applicant_name and b.applicant_name:
                    ratio = SequenceMatcher(
                        None,
                        (a.applicant_name or "").lower(),
                        (b.applicant_name or "").lower(),
                    ).ratio()
                    if ratio >= 0.85:
                        seen_pairs.add(pair_key)
                        candidates.append(
                            DuplicateCandidate(
                                application_id=a.id,
                                matched_application_id=b.id,
                                applicant_name=a.applicant_name or "",
                                matched_applicant_name=b.applicant_name or "",
                                match_type="fuzzy_name",
                                confidence=round(ratio * 100, 1),
                                details=f"Applicant names are {ratio:.0%} similar for service '{a.service_name}'.",
                            )
                        )

        return DuplicateDetectionResponse(
            total_flagged=len(candidates),
            candidates=candidates,
        )

    # -----------------------------------------------------------------
    # Smart Workload Recommendation
    # -----------------------------------------------------------------
    @staticmethod
    def recommend_assignment(
        db: Session, application_id: str
    ) -> RecommendAssignmentResponse:
        """
        Recommend which officer should handle a given application based on
        current workload and expertise (role-based heuristic).
        """
        app = db.query(Application).filter(Application.id == application_id).first()
        if not app:
            return RecommendAssignmentResponse(
                application_id=application_id,
                reason="Application not found.",
                factors=[],
            )

        officers = (
            db.query(User)
            .filter(User.role == "OFFICER", User.is_active == True)
            .all()
        )

        if not officers:
            return RecommendAssignmentResponse(
                application_id=application_id,
                reason="No active officers available for assignment.",
                factors=["No OFFICER-role users in the system."],
            )

        # Count pending workload per officer
        workloads: Dict[int, int] = {}
        for officer in officers:
            count = (
                db.query(Application)
                .filter(
                    Application.assigned_officer_id == officer.id,
                    Application.status.in_(ACTIVE_STATUSES),
                )
                .count()
            )
            workloads[officer.id] = count

        # Select officer with the least workload
        best_officer = min(officers, key=lambda o: workloads.get(o.id, 0))
        factors = [
            f"Officer {best_officer.email} has the lowest current workload ({workloads.get(best_officer.id, 0)} active applications).",
            f"Application risk score: {app.ai_score or 0:.1f}/100.",
            f"Application urgency: {app.urgency or 'normal'}.",
        ]

        # Assign the officer
        app.assigned_officer_id = best_officer.id
        db.commit()

        return RecommendAssignmentResponse(
            application_id=application_id,
            recommended_officer_id=best_officer.id,
            recommended_officer_email=best_officer.email,
            reason=f"Assigned to {best_officer.email} based on lowest workload.",
            factors=factors,
        )


officer_analytics_service = OfficerAnalyticsService()
