from fastapi import APIRouter, HTTPException
from app.models.schemas import GrievanceCreate
from app.core.firebase import get_db
import uuid

router = APIRouter()

@router.post("/")
def submit_grievance(grievance: GrievanceCreate):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
        
    ticket_id = f"GRV-{str(uuid.uuid4())[:8].upper()}"
    
    # Save to Firestore
    db.collection("grievances").document(ticket_id).set({
        "ticket_id": ticket_id,
        "name": grievance.name,
        "email": grievance.email,
        "department": grievance.department,
        "issue": grievance.issue,
        "status": "Open"
    })
    
    return {
        "success": True,
        "ticket_id": ticket_id,
        "message": f"Grievance submitted successfully to {grievance.department}."
    }
