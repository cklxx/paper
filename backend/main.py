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
from .models import Paper

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
