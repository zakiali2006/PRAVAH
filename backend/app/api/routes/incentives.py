from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

router = APIRouter()

TALUKA_CATEGORIES = [
    {"code": "A", "label": "Group A (Developed Areas - MMR / Pune PMC / PCMC)", "ceiling": 0, "years": 0, "sgst_percent": 0},
    {"code": "B", "label": "Group B (Developing Areas - Nashik / Kolhapur)", "ceiling": 60, "years": 7, "sgst_percent": 50},
    {"code": "C", "label": "Group C (Less Developed - Aurangabad / Ahmednagar)", "ceiling": 80, "years": 7, "sgst_percent": 75},
    {"code": "D", "label": "Group D (Least Developed - Solapur / Jalgaon / Dhule)", "ceiling": 100, "years": 9, "sgst_percent": 90},
    {"code": "D+", "label": "Group D+ (No Industry / Naxalite / Tribal - Gadchiroli / Nandurbar)", "ceiling": 100, "years": 10, "sgst_percent": 100},
]

SECTORS = [
    {"key": "manufacturing", "label": "Manufacturing & Heavy Engineering", "bump": 0},
    {"key": "agro", "label": "Agro & Food Processing", "bump": 10},
    {"key": "ev", "label": "Electric Vehicles (EV) & Components", "bump": 15},
    {"key": "electronics", "label": "IT, Electronics & Data Centers", "bump": 15},
    {"key": "textiles", "label": "Textiles & Technical Apparel", "bump": 10},
]


class IncentiveCalculateRequest(BaseModel):
    investment: float  # In Crores
    taluka_category: str  # A, B, C, D, D+
    sector: str = "manufacturing"
    employment: Optional[int] = 0
    sc_st_promoter: Optional[bool] = False


@router.get("/params")
def get_incentive_params():
    """Retrieve official statutory parameter tables under Maharashtra Industrial Policy PSI."""
    return {
        "taluka_categories": TALUKA_CATEGORIES,
        "sectors": SECTORS,
    }


@router.post("/calculate")
def calculate_incentives(request: IncentiveCalculateRequest):
    """
    Statutory estimation of eligible industrial subsidies under Maharashtra Package Scheme of Incentives (PSI).
    Calculates IPS (Gross SGST reimbursement), electricity duty waiver, and interest subsidy.
    """
    cr = float(request.investment)
    emp = int(request.employment or 0)
    cat_code = request.taluka_category.upper()
    has_sc_st = bool(request.sc_st_promoter)

    cat_row = next((c for c in TALUKA_CATEGORIES if c["code"] == cat_code), TALUKA_CATEGORIES[2])
    sec_row = next((s for s in SECTORS if s["key"].lower() == request.sector.lower()), SECTORS[0])

    # Determine enterprise scale
    if cr < 1:
        unit_scale = "Micro Enterprise"
    elif cr <= 10:
        unit_scale = "Small Enterprise"
    elif cr <= 50:
        unit_scale = "Medium Enterprise"
    elif cr <= 500:
        unit_scale = "Large Industrial Project"
    else:
        unit_scale = "Mega / Ultra Mega Project"

    # Ceiling & SGST calculations
    ceiling_pct = min(120, cat_row["ceiling"] + sec_row["bump"])
    if has_sc_st:
        ceiling_pct = min(130, ceiling_pct + 10)

    ceiling = (cr * ceiling_pct) / 100
    sgst_percent = cat_row["sgst_percent"]
    tenure_years = cat_row["years"]

    annual_estimated_sgst = (cr * 0.4) * 0.09
    annual_refund = annual_estimated_sgst * (sgst_percent / 100)
    total_sgst_refund = min(annual_refund * tenure_years, ceiling * 0.8)

    # Electricity duty exemption
    electricity_savings = 12.8 if "Large" in unit_scale or "Mega" in unit_scale else 1.5

    # Interest subsidy
    interest_subsidy = (cr * 0.05 * 5) if (has_sc_st or "Micro" in unit_scale or "Small" in unit_scale) else 0.0

    total_benefits = total_sgst_refund + electricity_savings + interest_subsidy

    return {
        "unitScale": unit_scale,
        "ceilingPct": ceiling_pct,
        "ceiling": round(ceiling, 2),
        "sgstPercent": sgst_percent,
        "tenureYears": tenure_years,
        "totalPotentialRefundCr": round(total_sgst_refund, 2),
        "electricityDutySavingsCr": round(electricity_savings, 2),
        "interestSubsidyCr": round(interest_subsidy, 2),
        "totalBenefitValueCr": round(total_benefits, 2),
        "total": round(total_benefits, 2),
        "catLabel": cat_row["label"],
        "secLabel": sec_row["label"],
        "cr": cr,
        "emp": emp,
    }
