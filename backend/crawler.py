import hashlib
import re
from dataclasses import dataclass
from typing import Iterable, Optional

import httpx

from .models import Paper, Source


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return slug or "paper"


def split_sentences(text: str) -> list[str]:
    cleaned = re.sub(r"\s+", " ", text)
    chunks = re.split(r"[。！？.!?]\s*", cleaned)
    return [chunk for chunk in chunks if chunk]


@dataclass
class Extraction:
    title: str
    summary: str
    paragraphs: list[str]


class AiTranscriber:
    def __call__(self, extraction: Extraction, url: str, topic: str) -> Paper:
        sentences = split_sentences(extraction.summary) or [extraction.title]
        padded = sentences + [
            f"{extraction.title} 探讨了 {topic} 的实践。"
        ] * (6 - len(sentences))
        hook, intuition, *rest = padded
        method_steps = rest[:3]
        tradeoff_good = rest[3] if len(rest) > 3 else f"{topic} 质量或效率更高"
        tradeoff_bad = (
            extraction.paragraphs[-1]
            if extraction.paragraphs
            else f"引入 {topic} 改动，需要额外算力或数据准备"
        )

        return Paper(
            id=f"{slugify(extraction.title)}-{hashlib.md5(url.encode('utf-8')).hexdigest()[:6]}",
            title=extraction.title,
            topic=topic,
            source=Source(title=extraction.title, url=url),
            cards=[
                {"type": "hook", "text": hook},
                {"type": "intuition", "text": intuition},
                {"type": "method", "steps": self._normalize_steps(method_steps)},
                {"type": "tradeoff", "good": tradeoff_good, "bad": tradeoff_bad},
                {
                    "type": "who",
                    "do": f"需要 {topic} 成果或复现 {extraction.title} 的团队",
                    "skip": f"对 {topic} 不敏感、已有稳定基线的场景",
                },
            ],
        )

    def _normalize_steps(self, steps: Iterable[str]) -> list[str]:
        normalized = []
        for index, step in enumerate(steps):
            prefix = f"步骤 {index + 1}："
            normalized.append(f"{prefix}{step.strip()}")
        while len(normalized) < 3:
            normalized.append(f"步骤 {len(normalized) + 1}：基于摘要生成的占位步骤")
        return normalized


class PaperCrawler:
    def __init__(self, client: Optional[httpx.Client] = None, transcriber: Optional[AiTranscriber] = None):
        self.client = client or httpx.Client(timeout=10)
        self.transcriber = transcriber or AiTranscriber()

    def crawl(self, url: str, topic: str) -> Paper:
        response = self.client.get(url)
        response.raise_for_status()

        extraction = self._extract(response.text, response.url)
        return self.transcriber(extraction, url=str(response.url), topic=topic)

    def _extract(self, html: str, resolved_url: httpx.URL) -> Extraction:
        title_match = re.search(r"<title>(.*?)</title>", html, flags=re.IGNORECASE | re.DOTALL)
        title = title_match.group(1).strip() if title_match else resolved_url.host or "未知论文"
        paragraphs = re.findall(r"<p[^>]*>(.*?)</p>", html, flags=re.IGNORECASE | re.DOTALL)
        cleaned_paragraphs = [re.sub("<.*?>", "", paragraph).strip() for paragraph in paragraphs if paragraph.strip()]
        summary = " ".join(cleaned_paragraphs[:3]) if cleaned_paragraphs else title
        return Extraction(title=title, summary=summary, paragraphs=cleaned_paragraphs)
