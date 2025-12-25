import json
import os
import sqlite3
from pathlib import Path
from typing import Iterable

from .models import Paper, Source

DB_PATH = Path(
    os.getenv("PAPER_DB_PATH", Path(__file__).resolve().parent / "papers.db")
)


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS papers (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                topic TEXT NOT NULL,
                source_title TEXT NOT NULL,
                source_url TEXT NOT NULL,
                cards TEXT NOT NULL
            )
            """
        )


def upsert_papers(papers: Iterable[Paper]) -> None:
    with get_connection() as conn:
        conn.executemany(
            """
            INSERT OR REPLACE INTO papers (id, title, topic, source_title, source_url, cards)
            VALUES (:id, :title, :topic, :source_title, :source_url, :cards)
            """,
            [
                {
                    "id": paper.id,
                    "title": paper.title,
                    "topic": paper.topic,
                    "source_title": paper.source.title,
                    "source_url": paper.source.url,
                    "cards": json.dumps([card.model_dump() for card in paper.cards]),
                }
                for paper in papers
            ],
        )


def list_papers() -> list[Paper]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, title, topic, source_title, source_url, cards FROM papers ORDER BY id"
        ).fetchall()
    return [
        Paper(
            id=row["id"],
            title=row["title"],
            topic=row["topic"],
            source=Source(title=row["source_title"], url=row["source_url"]),
            cards=json.loads(row["cards"]),
        )
        for row in rows
    ]


def fetch_paper(paper_id: str) -> Paper | None:
    with get_connection() as conn:
        row = conn.execute(
            """
            SELECT id, title, topic, source_title, source_url, cards
            FROM papers WHERE id = ?
            """,
            (paper_id,),
        ).fetchone()
    if not row:
        return None
    return Paper(
        id=row["id"],
        title=row["title"],
        topic=row["topic"],
        source=Source(title=row["source_title"], url=row["source_url"]),
        cards=json.loads(row["cards"]),
    )
