import os
from google import genai
from app.core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)
models = client.models.list()
for m in models:
    if "generateContent" in m.supported_generation_methods:
        print(m.name)
