from fastapi.testclient import TestClient
from main import app, get_status

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "AEO Readiness Auditor API is running"}

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "aeo-readiness-auditor"}

def test_get_status():
    assert get_status(95) == "healthy"
    assert get_status(90) == "healthy"
    assert get_status(80) == "warning"
    assert get_status(70) == "warning"
    assert get_status(69) == "critical"
    assert get_status(0) == "critical"
