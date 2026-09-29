import requests
import json

# Try an invalid validate
print("Testing validate with non-existent ID")
res = requests.post("http://localhost:8000/api/documents/9999/validate")
print(res.status_code)
print(res.text)

# Also let's check what the frontend is actually throwing by checking its logs.
