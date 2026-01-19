from typing import Any, Literal, Optional

from pydantic import BaseModel


class RunRequest(BaseModel):
    paper_id: str
    problem_id: str
    code: str


class RunResponse(BaseModel):
    status: Literal["ok", "error", "timeout"]
    passed: int
    failed: int
    total: int
    duration: float
    output: str
    error: str
    cases: list[dict[str, Any]]
    limitApplied: Optional[bool] = None
