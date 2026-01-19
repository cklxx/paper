from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .crawler import PaperCrawler
from .data import load_sample_papers
from .database import (
    fetch_paper,
    init_db,
    list_papers as fetch_all_papers,
    upsert_papers,
)
from .evaluator import run_problem
from .models import Paper
from .problems import get_problem
from .schemas import RunRequest, RunResponse

class CrawlRequest(BaseModel):
    url: str
    topic: str


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    upsert_papers(load_sample_papers())
    yield


app = FastAPI(title="Paper Swipe API", version="0.1.0", lifespan=lifespan)
crawler = PaperCrawler()


@app.get("/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/papers", response_model=list[Paper], tags=["papers"])
def list_papers_endpoint() -> list[Paper]:
    return fetch_all_papers()


@app.get("/papers/{paper_id}", response_model=Paper, tags=["papers"])
def get_paper(paper_id: str) -> Paper:
    paper = fetch_paper(paper_id)
    if paper is None:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper


@app.post("/crawl", response_model=Paper, tags=["crawler"])
def crawl_paper(request: CrawlRequest) -> Paper:
    try:
        paper = crawler.crawl(request.url, request.topic)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    upsert_papers([paper])
    return paper


@app.post("/api/run", response_model=RunResponse, tags=["judge"])
def run_endpoint(payload: RunRequest) -> RunResponse:
    try:
        problem = get_problem(payload.problem_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Problem not found")
    if problem["paper_id"] != payload.paper_id:
        raise HTTPException(status_code=404, detail="Problem not found")
    result = run_problem(problem, payload.code, run_all=False)
    return RunResponse(**result)


@app.post("/api/submit", response_model=RunResponse, tags=["judge"])
def submit_endpoint(payload: RunRequest) -> RunResponse:
    try:
        problem = get_problem(payload.problem_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Problem not found")
    if problem["paper_id"] != payload.paper_id:
        raise HTTPException(status_code=404, detail="Problem not found")
    result = run_problem(problem, payload.code, run_all=True)
    return RunResponse(**result)
