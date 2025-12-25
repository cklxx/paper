from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_papers():
    response = client.get("/papers")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 3
    assert payload[0]["id"] == "transformer-circuits"


def test_get_paper_found():
    response = client.get("/papers/flashattention")
    assert response.status_code == 200
    assert response.json()["topic"] == "Training"


def test_get_paper_not_found():
    response = client.get("/papers/missing")
    assert response.status_code == 404
    assert response.json()["detail"] == "Paper not found"
