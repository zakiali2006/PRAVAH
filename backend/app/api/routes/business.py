from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.models.user import User
from app.models.business import BusinessProfile, FactoryUnit
from app.api.deps import get_current_user
from app.schemas.business import (
    BusinessProfileCreate,
    BusinessProfileUpdate,
    BusinessProfileResponse,
    FactoryUnitCreate,
    FactoryUnitUpdate,
    FactoryUnitResponse,
)
from app.services.business_service import BusinessProfileService
from app.services.audit_service import audit_service, AuditAction
from app.core.responses import success_response

router = APIRouter()


def format_unit(unit: FactoryUnit) -> Dict[str, Any]:
    return {
        "id": unit.id,
        "business_id": unit.business_id,
        "unit_name": unit.unit_name,
        "midc_area": unit.midc_area or unit.midc_plot_number,
        "plot_number": unit.plot_number or unit.midc_plot_number,
        "survey_number": unit.survey_number,
        "taluka": unit.taluka,
        "district": unit.district or unit.location_district or "Pune",
        "category": unit.category or "Orange",
        "power_sanctioned_kva": unit.power_sanctioned_kva or 1500,
        "water_demand_kld": unit.water_demand_kld or 50,
        "built_up_area_sqm": unit.built_up_area_sqm or 12000,
        "land_area_sqm": unit.land_area_sqm,
        "operational_status": unit.operational_status or "Under Construction",
        "investment_amount": unit.investment_amount,
        "employment_count": unit.employment_count,
        # camelCase aliases for seamless frontend compatibility
        "unitName": unit.unit_name,
        "midcArea": unit.midc_area or unit.midc_plot_number or "",
        "plotNumber": unit.plot_number or unit.midc_plot_number or "",
        "surveyNumber": unit.survey_number or "",
        "powerSanctionedKva": unit.power_sanctioned_kva or 1500,
        "waterDemandKl": unit.water_demand_kld or 50,
        "builtUpAreaSqM": unit.built_up_area_sqm or 12000,
        "operationalStatus": unit.operational_status or "Under Construction",
    }


# =============================================================================
# Business Profile
# =============================================================================

@router.get("/me")
def get_my_business_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = BusinessProfileService.get_profile(db, current_user.id)
    if not profile:
        return success_response(data=None, message="No business profile found")
    
    data = BusinessProfileResponse.model_validate(profile).model_dump()
    data["units"] = [format_unit(u) for u in profile.factory_units]
    return success_response(data=data, message="Business profile retrieved")


@router.post("/")
def create_business_profile(
    profile_in: BusinessProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = BusinessProfileService.create_profile(db, profile_in, current_user.id)
    data = BusinessProfileResponse.model_validate(profile).model_dump()
    return success_response(data=data, message="Business profile created")


@router.put("/")
def update_business_profile(
    profile_in: BusinessProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = BusinessProfileService.update_profile(db, profile_in, current_user.id)
    data = BusinessProfileResponse.model_validate(profile).model_dump()
    return success_response(data=data, message="Business profile updated")


# =============================================================================
# Factory Units & MIDC Plots
# =============================================================================

@router.get("/units")
def list_factory_units(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all factory units associated with current user's business."""
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not profile:
        return success_response(data=[], message="No units found (profile not setup)")

    units = db.query(FactoryUnit).filter(FactoryUnit.business_id == profile.id).order_by(FactoryUnit.id.desc()).all()
    formatted = [format_unit(u) for u in units]
    return success_response(data=formatted, message=f"{len(formatted)} units found")


@router.post("/units")
def create_factory_unit(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Register a new factory unit or MIDC plot parcel."""
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not profile:
        # Auto-create basic profile if absent so investor is not blocked
        profile = BusinessProfile(
            user_id=current_user.id,
            company_name=payload.get("company_name", "Registered Enterprise"),
            pan_number=payload.get("pan_number", f"PAN{current_user.id:06d}"),
            industry_sector="Manufacturing",
            registration_type="Private Limited",
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Support both snake_case and camelCase keys
    unit_name = payload.get("unit_name") or payload.get("unitName") or "New Industrial Unit"
    midc_area = payload.get("midc_area") or payload.get("midcArea")
    plot_number = payload.get("plot_number") or payload.get("plotNumber")
    survey_number = payload.get("survey_number") or payload.get("surveyNumber")
    taluka = payload.get("taluka") or "Khed"
    district = payload.get("district") or "Pune"
    category = payload.get("category") or "Orange"
    power = payload.get("power_sanctioned_kva") or payload.get("powerSanctionedKva") or 1500.0
    water = payload.get("water_demand_kld") or payload.get("waterDemandKl") or 50.0
    built_up = payload.get("built_up_area_sqm") or payload.get("builtUpAreaSqM") or 12000.0
    operational_status = payload.get("operational_status") or payload.get("operationalStatus") or "Under Construction"
    investment_amount = payload.get("investment_amount") or payload.get("investmentAmount")
    employment_count = payload.get("employment_count") or payload.get("employmentCount")

    unit = FactoryUnit(
        business_id=profile.id,
        unit_name=unit_name,
        midc_area=midc_area,
        plot_number=plot_number,
        survey_number=survey_number,
        taluka=taluka,
        district=district,
        category=category,
        power_sanctioned_kva=float(power),
        water_demand_kld=float(water),
        built_up_area_sqm=float(built_up),
        operational_status=operational_status,
        investment_amount=float(investment_amount) if investment_amount else None,
        employment_count=int(employment_count) if employment_count else None,
        midc_plot_number=plot_number,
        location_district=district,
    )
    db.add(unit)
    db.commit()
    db.refresh(unit)

    audit_service.log(
        db,
        actor_id=current_user.id,
        action="REGISTER_FACTORY_UNIT",
        entity_type="factory_units",
        entity_id=str(unit.id),
        after_data={"unit_name": unit.unit_name, "plot_number": unit.plot_number},
    )

    return success_response(data=format_unit(unit), message="Factory unit registered successfully")


@router.delete("/units/{unit_id}")
def delete_factory_unit(
    unit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    unit = db.query(FactoryUnit).filter(FactoryUnit.id == unit_id, FactoryUnit.business_id == profile.id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    db.delete(unit)
    db.commit()

    audit_service.log(
        db,
        actor_id=current_user.id,
        action="DELETE_FACTORY_UNIT",
        entity_type="factory_units",
        entity_id=str(unit_id),
    )

    return success_response(message="Factory unit deleted successfully")
