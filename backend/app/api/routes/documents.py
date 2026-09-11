from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.services.ocr_service import process_document_image
from app.api.dependencies.auth import get_current_user

router = APIRouter()

@router.post("/validate")
async def validate_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if file.content_type not in ["image/jpeg", "image/png", "application/pdf"]:
        raise HTTPException(status_code=400, detail="Please upload a JPG, PNG, or PDF.")
    
    try:
        contents = await file.read()
        business_name = current_user.get("business_name", "Unknown Business")
        
        validation_result = await process_document_image(
            file_bytes=contents, 
            content_type=file.content_type, 
            business_name=business_name
        )
        
        return {
            "filename": file.filename,
            "status": "Pass" if validation_result["success"] else "Fail",
            "proof": validation_result["proof"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR Processing failed: {str(e)}")
