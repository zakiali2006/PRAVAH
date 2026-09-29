from google import genai
from app.core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

print("Available models:")
for model in client.models.list():
    if "flash" in model.name:
        print(model.name)

try:
    print("\nTesting gemini-3.6-flash...")
    res = client.models.generate_content(model="gemini-3.6-flash", contents="Hello")
    print("Success:", res.text)
except Exception as e:
    print("ERROR:", repr(e))
