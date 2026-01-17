import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from main import app, get_optional_current_user

# Mock Dependencies
async def mock_get_user():
    return {"id": "test-user-id", "email": "test@example.com"}

# Override dependency
app.dependency_overrides[get_optional_current_user] = mock_get_user

client = TestClient(app)

@pytest.fixture
def mock_analyze_readiness():
    with patch("main.analyze_readiness", new_callable=AsyncMock) as mock:
        mock.return_value = {
            "total_score": 85,
            "breakdown": {
                "technical": {"robots": {"score": 100}, "schema": {"score": 50}},
                "content": {}
            },
            "technical_score": 90,
            "content_score": 80,
            "competitors": {}
        }
        yield mock

@pytest.fixture
def mock_supabase():
    with patch("main.supabase") as mock:
        # Mock site existence check
        mock.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {"id": "site-123", "user_id": "test-user-id", "status": "completed"}
        ]
        # Mock site list for limits
        mock.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        yield mock

def test_analyze_endpoint_guest(mock_analyze_readiness):
    # Override user to None for guest test
    app.dependency_overrides[get_optional_current_user] = lambda: None
    
    response = client.post("/analyze", json={"url": "https://example.com", "sync": True})
    assert response.status_code == 200
    assert response.json()["score"] == 85
    
    # Restore user
    app.dependency_overrides[get_optional_current_user] = mock_get_user

def test_analyze_endpoint_auth(mock_analyze_readiness, mock_supabase):
    response = client.post("/analyze", json={"url": "https://example.com", "site_id": "site-123", "sync": True})
    assert response.status_code == 200
    # Should check ownership
    mock_supabase.table.assert_called()

def test_schedule_scan_conflict(mock_supabase):
    # Mock existing pending scan
    mock_supabase.table.return_value.select.return_value.eq.return_value.in_.return_value.execute.return_value.data = [{"id": "pending-scan"}]
    
    response = client.post("/schedule-scan", json={"url": "https://example.com", "site_id": "site-123", "delay_hours": 24})
    assert response.status_code == 409
    assert "already scheduled" in response.json()["detail"]

def test_cancel_scan_success(mock_supabase):
     # Mock existing pending scan
    mock_supabase.table.return_value.select.return_value.eq.return_value.in_.return_value.execute.return_value.data = [{"id": "pending-scan"}]
    
    response = client.post("/cancel-scan", json={"site_id": "site-123"})
    assert response.status_code == 200
    assert response.json()["message"] == "Scan cancelled successfully."
