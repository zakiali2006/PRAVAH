from fastapi import APIRouter, HTTPException
from app.models.schemas import IncentiveCalculateRequest
from app.core.firebase import get_db

router = APIRouter()

@router.get("/params")
def get_incentive_params():
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    taluka_doc = db.collection("pravah_config").document("taluka_cat").get()
    sectors_doc = db.collection("pravah_config").document("sectors").get()
    
    return {
        "taluka_categories": taluka_doc.to_dict().get("data", []) if taluka_doc.exists else [],
        "sectors": sectors_doc.to_dict().get("data", []) if sectors_doc.exists else []
    }
@router.post("/calculate")
def calculate_incentives(request: IncentiveCalculateRequest):
    """
    Takes the user's investment input and returns the estimated eligible subsidies.
    Phase 7: Incentive Calculator
    """
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    taluka_doc = db.collection("pravah_config").document("taluka_cat").get()
    sectors_doc = db.collection("pravah_config").document("sectors").get()
    
    if not taluka_doc.exists or not sectors_doc.exists:
        raise HTTPException(status_code=500, detail="Configuration data missing in database")
        
    talukas = taluka_doc.to_dict().get("data", [])
    sectors = sectors_doc.to_dict().get("data", [])
    
    cat_row = next((c for c in talukas if c["code"] == request.taluka_category), None)
    sec_row = next((s for s in sectors if s["key"] == request.sector), None)
    
    if not cat_row or not sec_row:
        raise HTTPException(status_code=400, detail="Invalid sector or taluka category")
        
    cr = request.investment
    emp = getattr(request, 'employment', 0)
    
    ceilingPct = max(0, min(120, cat_row["ceiling"] + sec_row["bump"]))
    ceiling = (cr * ceilingPct) / 100
    capital = min(ceiling * 0.35, cr * 0.2)
    sgst = ceiling * 0.4
    interest = min(cr * 0.05, ceiling * 0.15)
    power = emp * 0.005
    stamp = cr * 0.006
    total = capital + sgst + interest + power + stamp
    
    return {
        "ceilingPct": ceilingPct,
        "ceiling": ceiling,
        "capital": capital,
        "sgst": sgst,
        "interest": interest,
        "power": power,
        "stamp": stamp,
        "total": total,
        "years": cat_row["years"],
        "catLabel": cat_row["label"],
        "secLabel": sec_row["label"],
        "cr": cr,
        "emp": emp
    }
