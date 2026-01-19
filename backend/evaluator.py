from __future__ import annotations

import json
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Any

from .problems import Problem

MEMORY_LIMIT_MB = 256
MEMORY_LIMIT_BYTES = MEMORY_LIMIT_MB * 1024 * 1024

RUNNER_SOURCE = """
import importlib.util
import json
import traceback


def _apply_limits():
    try:
        import resource
    except Exception:
        return False

    applied = False
    limit = __MEMORY_LIMIT__
    for attr in ("RLIMIT_AS", "RLIMIT_DATA"):
        resource_key = getattr(resource, attr, None)
        if resource_key is None:
            continue
        try:
            resource.setrlimit(resource_key, (limit, limit))
            applied = True
        except Exception:
            continue
    return applied


def _disable_network():
    try:
        import socket

        def blocked(*_args, **_kwargs):
            raise RuntimeError("Network disabled")

        socket.socket = blocked
        socket.create_connection = blocked
        socket.getaddrinfo = blocked
    except Exception:
        return


def _load_solution():
    spec = importlib.util.spec_from_file_location("solution", "solution.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _normalize(value, precision):
    if isinstance(value, float):
        return round(value, precision)
    if isinstance(value, list):
        return [_normalize(item, precision) for item in value]
    if isinstance(value, tuple):
        return [_normalize(item, precision) for item in value]
    if isinstance(value, dict):
        return {key: _normalize(val, precision) for key, val in value.items()}
    return value


def _is_equal(actual, expected, precision):
    return _normalize(actual, precision) == _normalize(expected, precision)


def main():
    with open("cases.json", "r", encoding="utf-8") as handle:
        payload = json.load(handle)

    entry = payload["entry"]
    tests = payload["tests"]
    precision = payload.get("precision", 4)

    limit_applied = _apply_limits()
    _disable_network()

    module = _load_solution()
    fn = getattr(module, entry)

    cases = []
    passed = 0

    for case in tests:
        args = case.get("args", [])
        expected = case.get("expected")
        try:
            output = fn(*args)
            ok = _is_equal(output, expected, precision)
            if ok:
                passed += 1
            cases.append(
                {
                    "ok": ok,
                    "args": args,
                    "expected": expected,
                    "output": output,
                }
            )
        except Exception:
            cases.append(
                {
                    "ok": False,
                    "args": args,
                    "expected": expected,
                    "output": None,
                    "error": traceback.format_exc(),
                }
            )

    result = {
        "status": "ok",
        "passed": passed,
        "failed": len(tests) - passed,
        "total": len(tests),
        "cases": cases,
        "limitApplied": limit_applied,
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()
"""
RUNNER_SOURCE = RUNNER_SOURCE.replace("__MEMORY_LIMIT__", str(MEMORY_LIMIT_BYTES))


def run_problem(problem: Problem, code: str, run_all: bool) -> dict[str, Any]:
    tests = problem["tests"] if run_all else problem["tests"][: problem["run_count"]]
    payload = {
        "entry": problem["spec"]["entry"],
        "tests": tests,
        "precision": problem["spec"]["precision"],
    }

    with tempfile.TemporaryDirectory() as workdir:
        work_path = Path(workdir)
        (work_path / "solution.py").write_text(code, encoding="utf-8")
        (work_path / "cases.json").write_text(json.dumps(payload), encoding="utf-8")
        (work_path / "runner.py").write_text(RUNNER_SOURCE, encoding="utf-8")

        start = time.time()
        try:
            completed = subprocess.run(
                ["python3", "-I", "runner.py"],
                cwd=workdir,
                capture_output=True,
                text=True,
                timeout=problem["spec"]["time_limit_sec"],
            )
        except subprocess.TimeoutExpired:
            return {
                "status": "timeout",
                "passed": 0,
                "failed": len(tests),
                "total": len(tests),
                "duration": problem["spec"]["time_limit_sec"],
                "output": "",
                "error": "Time limit exceeded",
                "cases": [],
            }

        duration = time.time() - start

        if completed.returncode != 0:
            return {
                "status": "error",
                "passed": 0,
                "failed": len(tests),
                "total": len(tests),
                "duration": duration,
                "output": completed.stdout,
                "error": completed.stderr,
                "cases": [],
            }

        try:
            result = json.loads(completed.stdout.strip())
        except json.JSONDecodeError:
            return {
                "status": "error",
                "passed": 0,
                "failed": len(tests),
                "total": len(tests),
                "duration": duration,
                "output": completed.stdout,
                "error": "Invalid runner output",
                "cases": [],
            }

        result["duration"] = duration
        result.setdefault("output", completed.stdout)
        result.setdefault("error", "")
        return result
