from typing import List, Literal, Union

from pydantic import BaseModel


CardType = Literal["hook", "intuition", "method", "tradeoff", "who", "source"]


class MethodCard(BaseModel):
    type: Literal["method"]
    steps: List[str]


class HookCard(BaseModel):
    type: Literal["hook"]
    text: str


class IntuitionCard(BaseModel):
    type: Literal["intuition"]
    text: str


class TradeoffCard(BaseModel):
    type: Literal["tradeoff"]
    good: str
    bad: str


class WhoCard(BaseModel):
    type: Literal["who"]
    do: str
    skip: str


class SourceCard(BaseModel):
    type: Literal["source"]
    title: str
    url: str


Card = Union[HookCard, IntuitionCard, MethodCard, TradeoffCard, WhoCard, SourceCard]


class Source(BaseModel):
    title: str
    url: str


class Paper(BaseModel):
    id: str
    title: str
    topic: str
    source: Source
    cards: List[Card]
