import os
import pymupdf
from google import genai
from google.genai import types
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings


@retry(wait=wait_exponential(multiplier=1, min=2, max=10), stop=stop_after_attempt(3))
def extract_raw_text(file_path: str, mime_type: str) -> str:
    """
    Phase 4: OCR Engine
    Extracts raw text exactly as seen in the image or PDF document.
    Uses Google Gemini Vision for accurate, layout-aware OCR.
    Retries automatically if the API experiences temporary 503 issues.
    """

    # 1. Prepare the image bytes
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    image_bytes = None

    if mime_type == "application/pdf":
        # Convert first page of PDF to image
        doc = pymupdf.open(file_path)
        if len(doc) == 0:
            raise ValueError("The uploaded PDF is empty.")
        page = doc.load_page(0)
        pix = page.get_pixmap()
        image_bytes = pix.tobytes("jpeg")
        doc.close()
        gemini_mime_type = "image/jpeg"
    elif mime_type in [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
    ]:
        with open(file_path, "rb") as f:
            image_bytes = f.read()
        gemini_mime_type = mime_type
    else:
        raise ValueError(f"Unsupported MIME type for OCR: {mime_type}")

    # 2. Call Gemini Vision purely for OCR
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set in configuration.")

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt = """
    Perform Optical Character Recognition (OCR) on this document.
    Extract ALL the text exactly as it appears in the document.
    Do not add, summarize, or omit anything. Maintain the structure as best as possible.
    If the document is unreadable, output: UNREADABLE_DOCUMENT
    """

    model_name = (
        settings.AI_MODEL_TEXT if settings.AI_MODEL_TEXT else "gemini-3.8-flash"
    )

    response = client.models.generate_content(
        model=model_name,
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=gemini_mime_type),
            prompt,
        ],
        config=types.GenerateContentConfig(
            temperature=0.0,  # Deterministic OCR
        ),
    )

    return response.text.strip()
