import easyocr
import pymupdf  # Replaces deprecated fitz
from PIL import Image
import io
import re
from datetime import datetime

# Initialize the reader globally so it only loads into memory once
reader = easyocr.Reader(['en', 'mr'], gpu=False) 

async def process_document_image(file_bytes: bytes, content_type: str, business_name: str) -> dict:
    """Extracts text from an image/PDF and validates against the user's business profile."""
    
    # 1. Handle PDFs by converting the first page to an image
    if content_type == 'application/pdf':
        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
        if len(doc) == 0:
            return {"success": False, "proof": "❌ Error: The uploaded PDF is empty."}
        page = doc.load_page(0)
        pix = page.get_pixmap()
        image_bytes = pix.tobytes("png")
        doc.close()
    else:
        image_bytes = file_bytes
        
    # 2. Run the EasyOCR model
    result = reader.readtext(image_bytes, detail=0)
    extracted_text = " ".join(result)
    
    # 3. Contextual Validation Logic
    extracted_lower = extracted_text.lower()
    business_lower = business_name.lower()
    
    # A. Name Matching
    if business_lower not in extracted_lower:
        return {
            "success": False,
            "proof": f"❌ Name Mismatch: The document does not contain your registered business name '{business_name}'."
        }
        
    # B. Expiry Check (Look for common date formats like DD/MM/YYYY)
    date_pattern = r'\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b'
    dates_found = re.findall(date_pattern, extracted_text)
    
    for (day, month, year) in dates_found:
        try:
            doc_date = datetime(int(year), int(month), int(day))
            if doc_date < datetime.now():
                # Found a date in the past. We'll aggressively assume it's an expiry for the MVP demo
                return {
                    "success": False,
                    "proof": f"❌ Document Expired: Found expiry date '{day}/{month}/{year}'. Document is no longer valid."
                }
        except ValueError:
            pass # Ignore invalid dates like 31/02/2025
            
    # C. Completeness
    if "signature" not in extracted_lower and "signed" not in extracted_lower:
        return {
            "success": False,
            "proof": "❌ Missing Signature: The document does not appear to be signed by an authorized signatory."
        }

    return {
        "success": True,
        "proof": "✅ Document passed all AI validations."
    }
