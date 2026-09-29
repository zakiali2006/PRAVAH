import json
from google import genai
from google.genai import types
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.ai.prompts.document_extraction import EXTRACTION_PROMPT
from app.schemas.extraction import DocumentExtractionResult


@retry(wait=wait_exponential(multiplier=1, min=2, max=10), stop=stop_after_attempt(3))
def extract_structured_data(
    raw_text: str, document_type: str
) -> DocumentExtractionResult:
    """
    Phase 5: Extraction Engine
    Takes raw OCR text and uses Gemini to extract structured fields.
    Returns a validated Pydantic model (DocumentExtractionResult).
    Retries automatically if the API experiences temporary 503 issues.
    """

    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set in configuration.")

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    # Format the prompt
    prompt = EXTRACTION_PROMPT.format(document_type=document_type, raw_text=raw_text)

    model_name = (
        settings.AI_MODEL_TEXT if settings.AI_MODEL_TEXT else "gemini-1.5-flash"
    )

    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.0,  # Deterministic extraction
            response_mime_type="application/json",
            response_schema=DocumentExtractionResult,
        ),
    )

    text = response.text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]

    json_data = json.loads(text.strip())
    return DocumentExtractionResult(**json_data)
