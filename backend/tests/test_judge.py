from backend.evaluator import run_problem
from backend.problems import get_problem

GOOD_CODE = """
import math

def positional_encoding(max_len: int, d_model: int):
    result = []
    for pos in range(max_len):
        row = []
        for i in range(d_model):
            angle = pos / (10000 ** (2 * (i // 2) / d_model))
            if i % 2 == 0:
                row.append(math.sin(angle))
            else:
                row.append(math.cos(angle))
        result.append(row)
    return result
"""

BAD_CODE = """

def positional_encoding(max_len: int, d_model: int):
    return []
"""

NETWORK_CODE = """
import socket

def positional_encoding(max_len: int, d_model: int):
    socket.socket()
    return []
"""

LIMIT_CODE = """
import resource

def positional_encoding(max_len: int, d_model: int):
    return {
        "as": resource.getrlimit(resource.RLIMIT_AS),
        "data": resource.getrlimit(resource.RLIMIT_DATA),
    }
"""


def test_run_problem_passes():
    problem = get_problem("a1_positional_encoding")
    result = run_problem(problem, GOOD_CODE, run_all=False)
    assert result["status"] == "ok"
    assert result["failed"] == 0
    assert result["total"] == problem["run_count"]


def test_run_problem_fails():
    problem = get_problem("a1_positional_encoding")
    result = run_problem(problem, BAD_CODE, run_all=True)
    assert result["failed"] >= 1


def test_run_problem_blocks_network():
    problem = get_problem("a1_positional_encoding")
    result = run_problem(problem, NETWORK_CODE, run_all=False)
    assert result["failed"] >= 1
    assert "Network" in (result["cases"][0].get("error") or "")


def test_run_problem_sets_memory_limit():
    problem = get_problem("a1_positional_encoding")
    result = run_problem(problem, LIMIT_CODE, run_all=False)
    limit_applied = result.get("limitApplied")
    assert isinstance(limit_applied, bool)
    limits = result["cases"][0].get("output", {})
    as_limit = limits.get("as", [0])[0]
    data_limit = limits.get("data", [0])[0]
    effective = [limit for limit in (as_limit, data_limit) if limit > 0]
    if limit_applied:
        assert any(limit < 512 * 1024 * 1024 for limit in effective)
