from fastapi import APIRouter, HTTPException
from app.core.firebase import get_db

router = APIRouter()

@router.get("/")
def get_services():
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized (missing Firebase credentials)")
    
    doc = db.collection("pravah_config").document("service_groups").get()
    if doc.exists:
        return {"data": doc.to_dict().get("data", [])}
    return {"data": []}
