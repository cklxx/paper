import json
from functools import lru_cache
from pathlib import Path

from .models import Paper, Source

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "paper_seeds.json"


@lru_cache(maxsize=1)
def load_sample_papers() -> list[Paper]:
    with DATA_PATH.open(encoding="utf-8") as handle:
        seeds = json.load(handle)

    papers: list[Paper] = []
    for seed in seeds:
        papers.append(
            Paper(
                id=seed["id"],
                title=seed["title"],
                topic=seed["topic"],
                source=Source(**seed["source"]),
                cards=[
                    {"type": "hook", "text": seed["cards"]["hook"]},
                    {"type": "intuition", "text": seed["cards"]["intuition"]},
                    {"type": "method", "steps": seed["cards"]["method"]},
                    {
                        "type": "tradeoff",
                        "good": seed["cards"]["tradeoff"]["good"],
                        "bad": seed["cards"]["tradeoff"]["bad"],
                    },
                    {
                        "type": "who",
                        "do": seed["cards"]["who"]["do"],
                        "skip": seed["cards"]["who"]["skip"],
                    },
                    {"type": "source", "title": seed["source"]["title"], "url": seed["source"]["url"]},
                ],
            )
        )
    return papers
