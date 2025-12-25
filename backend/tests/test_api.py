import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

TEST_DB_PATH = Path(__file__).resolve().parent / "papers.test.db"
os.environ["PAPER_DB_PATH"] = str(TEST_DB_PATH)
if TEST_DB_PATH.exists():
    TEST_DB_PATH.unlink()

from backend.main import app, crawler  # noqa: E402


@pytest.fixture(scope="module")
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


def test_health(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_papers(client: TestClient):
    response = client.get("/papers")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) >= 100
    assert any(paper["id"] == "attention-is-all-you-need" for paper in payload)
    assert all("source" in paper for paper in payload)


def test_get_paper_found(client: TestClient):
    response = client.get("/papers/attention-is-all-you-need")
    assert response.status_code == 200
    assert response.json()["topic"] == "Architecture"


def test_get_paper_not_found(client: TestClient):
    response = client.get("/papers/missing")
    assert response.status_code == 404
    assert response.json()["detail"] == "Paper not found"


def test_crawl_persists(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    import httpx

    class DummyResponse:
        def __init__(self):
            self.text = "<html><head><title>示例论文</title></head><body><p>大模型推理很慢。</p><p>我们加速推理。</p></body></html>"
            self.url = httpx.URL("https://example.com/paper")

        def raise_for_status(self):
            return None

    def fake_get(url: str):
        return DummyResponse()

    monkeypatch.setattr(crawler.client, "get", fake_get)

    crawl_response = client.post("/crawl", json={"url": "https://example.com/paper", "topic": "Test"})
    assert crawl_response.status_code == 200

    data = crawl_response.json()
    assert data["source"]["url"] == "https://example.com/paper"
    assert data["cards"][0]["type"] == "hook"

    papers_response = client.get("/papers")
    assert any(paper["id"] == data["id"] for paper in papers_response.json())
