from app.engines.extraction_engine import extract_structured_data
from app.engines.ocr_engine import extract_raw_text

print("Testing OCR Engine...")
try:
    # Need a dummy image or pdf. I will create a dummy image.
    with open("test.txt", "w") as f:
        f.write("Dummy")
    
    # Actually wait, extract_raw_text expects a valid image. 
    # Let's just test extraction_engine directly!
    print("Testing Extraction Engine...")
    result = extract_structured_data("This is a certificate of incorporation for Acme Corp, U12345MH2024PTC123456, issued on 2024-01-01 at 123 Fake Street, Mumbai. Signatures present.", "Certificate of Incorporation")
    print(result)
except Exception as e:
    print(f"FAILED: {e}")
