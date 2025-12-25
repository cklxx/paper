import json
from functools import lru_cache
from pathlib import Path

from .models import Paper, Source

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "paper_seeds.json"
VARIANTS_PER_SEED = 10


def _variant_text(text: str, variant_index: int) -> str:
    if variant_index == 0:
        return text
    return f"{text}（案例 {variant_index + 1}）"


def _variant_steps(steps: list[str], variant_index: int) -> list[str]:
    return [
        step if variant_index == 0 else f"{step} · 迭代 {variant_index + 1}"
        for step in steps
    ]


@lru_cache(maxsize=1)
def load_sample_papers() -> list[Paper]:
    with DATA_PATH.open(encoding="utf-8") as handle:
        seeds = json.load(handle)

    papers: list[Paper] = []
    for seed in seeds:
        for variant_index in range(VARIANTS_PER_SEED):
            suffix = "" if variant_index == 0 else f"-v{variant_index + 1}"
            papers.append(
                Paper(
                    id=f"{seed['id']}{suffix}",
                    title=f"{seed['title']} · 场景 {variant_index + 1}",
                    topic=seed["topic"],
                    source=Source(**seed["source"]),
                    cards=[
                        {"type": "hook", "text": _variant_text(seed["cards"]["hook"], variant_index)},
                        {
                            "type": "intuition",
                            "text": _variant_text(seed["cards"]["intuition"], variant_index),
                        },
                        {
                            "type": "method",
                            "steps": _variant_steps(seed["cards"]["method"], variant_index),
                        },
                        {
                            "type": "tradeoff",
                            "good": _variant_text(seed["cards"]["tradeoff"]["good"], variant_index),
                            "bad": _variant_text(seed["cards"]["tradeoff"]["bad"], variant_index),
                        },
                        {
                            "type": "who",
                            "do": _variant_text(seed["cards"]["who"]["do"], variant_index),
                            "skip": _variant_text(seed["cards"]["who"]["skip"], variant_index),
                        },
                    ],
                )
            )
    return papers
