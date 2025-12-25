from fastapi import FastAPI, HTTPException
from .data import find_paper, get_papers
from .models import Paper

app = FastAPI(title="Paper Swipe API", version="0.1.0")


@app.get("/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/papers", response_model=list[Paper], tags=["papers"])
def list_papers() -> list[Paper]:
    return get_papers()


@app.get("/papers/{paper_id}", response_model=Paper, tags=["papers"])
def get_paper(paper_id: str) -> Paper:
    paper = find_paper(paper_id)
    if paper is None:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper
