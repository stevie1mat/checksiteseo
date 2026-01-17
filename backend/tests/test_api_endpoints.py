import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock
from main import app, get_optional_current_user

# Mock Dependencies
class MockUser:
    def __init__(self):
        self.id = "test-user-id"
        self.email = "test@example.com"

async def mock_get_user():
    return MockUser()

# Override dependency
app.dependency_overrides[get_optional_current_user] = mock_get_user
app.dependency_overrides["get_current_user"] = mock_get_user # Functionally same for test

from main import get_current_user
app.dependency_overrides[get_current_user] = mock_get_user


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
        # Generic mock setup for chaining
        # The key is that we need to return 'self' for intermediate calls
        # and a final object with .data for execute()
        
        mock_query = MagicMock()
        mock_query.data = [{"id": "site-123", "user_id": "test-user-id", "status": "completed"}]
        
        # Configure the chain
        # supabase.table().select().eq() ... .execute()
        mock.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_query
        
        # Handle multiple .eq calls (chaining)
        # e.g. .eq().eq().execute()
        mock.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = mock_query
        
        # Handle .in_() calls
        mock.table.return_value.select.return_value.eq.return_value.in_.return_value.execute.return_value = mock_query
        
        # Site Update
        mock.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()
        
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
