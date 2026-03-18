from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

response = client.post("/output/40e7a4dc-dab4-4528-a837-f0d715f12e0a/feedback", params={"feedback": "hello world"})
print("Status:", response.status_code)
print("Data:", response.json())
