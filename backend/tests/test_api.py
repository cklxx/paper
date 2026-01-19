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
    assert len(payload) >= 60
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


def test_run_problem_endpoint(client: TestClient):
    code = """
import math

def positional_encoding(max_len: int, d_model: int):
    result = []
    for pos in range(max_len):
        row = []
        for i in range(d_model):
            angle = pos / (10000 ** (2 * (i // 2) / d_model))
            if i % 2 == 0:
                row.append(math.sin(angle))
            else:
                row.append(math.cos(angle))
        result.append(row)
    return result
"""
    response = client.post(
        "/api/run",
        json={
            "paper_id": "attention_is_all_you_need",
            "problem_id": "a1_positional_encoding",
            "code": code,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["total"] == 1


def test_submit_problem_endpoint(client: TestClient):
    code = """
import math

def positional_encoding(max_len: int, d_model: int):
    result = []
    for pos in range(max_len):
        row = []
        for i in range(d_model):
            angle = pos / (10000 ** (2 * (i // 2) / d_model))
            if i % 2 == 0:
                row.append(math.sin(angle))
            else:
                row.append(math.cos(angle))
        result.append(row)
    return result
"""
    response = client.post(
        "/api/submit",
        json={
            "paper_id": "attention_is_all_you_need",
            "problem_id": "a1_positional_encoding",
            "code": code,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["total"] == 2
