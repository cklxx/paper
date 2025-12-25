from pydantic import BaseModel
from typing import List, Literal


CardType = Literal["hook", "intuition", "method", "tradeoff", "who"]


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


Card = HookCard | IntuitionCard | MethodCard | TradeoffCard | WhoCard


class Paper(BaseModel):
    id: str
    title: str
    topic: str
    cards: List[Card]
