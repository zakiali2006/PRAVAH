import os
from google import genai
from app.core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

for model in ["gemini-3.6-flash", "gemini-3.7-flash", "gemini-flash-latest", "gemini-3.5-flash"]:
    print(f"Testing {model}...")
    try:
        response = client.models.generate_content(
            model=model,
            contents="Hello, this is a test."
        )
        print(f"Success with {model}: {response.text}")
        break
    except Exception as e:
        print(f"Failed with {model}: {e}")
