from __future__ import annotations

import json
from pathlib import Path
from typing import Any, TypedDict

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "paper_seeds.json"
ATTENTION_PAPER_ID = "attention_is_all_you_need"


class ProblemSpec(TypedDict):
    entry: str
    input: str
    output: str
    time_limit_sec: int
    precision: int


class TestCase(TypedDict, total=False):
    args: list[Any]
    expected: Any
    note: str


class Problem(TypedDict):
    id: str
    paper_id: str
    title: str
    type: str
    difficulty: str
    description: str
    goal: str
    constraints: list[str]
    spec: ProblemSpec
    starter: str
    tests: list[TestCase]
    run_count: int


class ProblemTemplate(TypedDict):
    id_suffix: str
    title: str
    type: str
    difficulty: str
    description: str
    goal: str
    constraints: list[str]
    spec: ProblemSpec
    starter: str
    tests: list[TestCase]
    run_count: int


ATTENTION_TEMPLATES: list[ProblemTemplate] = [
    {
        "id_suffix": "a1_positional_encoding",
        "title": "位置编码",
        "type": "实现",
        "difficulty": "中等",
        "description": "实现正弦位置编码矩阵。",
        "goal": "返回长度为 max_len 的位置编码矩阵。",
        "constraints": ["d_model 为偶数", "使用 sin/cos 公式"],
        "spec": {
            "entry": "positional_encoding",
            "input": "max_len: int, d_model: int",
            "output": "List[List[float]]",
            "time_limit_sec": 2,
            "precision": 4,
        },
        "starter": "def positional_encoding(max_len: int, d_model: int):\n    raise NotImplementedError\n",
        "tests": [
            {
                "args": [1, 4],
                "expected": [[0, 1, 0, 1]],
                "note": "最小形态",
            },
            {
                "args": [2, 2],
                "expected": [[0, 1], [0.8415, 0.5403]],
                "note": "前两步",
            },
        ],
        "run_count": 1,
    },
    {
        "id_suffix": "a2_scaled_dot_attention",
        "title": "注意力权重",
        "type": "理解",
        "difficulty": "中等",
        "description": "计算缩放点积注意力权重。",
        "goal": "返回每个 key 的 softmax 权重。",
        "constraints": ["使用缩放系数 1/sqrt(d)", "softmax 输出保留 4 位小数"],
        "spec": {
            "entry": "attention_weights",
            "input": "query: List[float], keys: List[List[float]]",
            "output": "List[float]",
            "time_limit_sec": 2,
            "precision": 4,
        },
        "starter": "def attention_weights(query: list[float], keys: list[list[float]]):\n    raise NotImplementedError\n",
        "tests": [
            {
                "args": [[1, 0], [[1, 0], [0, 1]]],
                "expected": [0.6698, 0.3302],
                "note": "正交 key",
            },
            {
                "args": [[1, 1], [[1, 0], [0, 1]]],
                "expected": [0.5, 0.5],
                "note": "对称情况",
            },
        ],
        "run_count": 1,
    },
    {
        "id_suffix": "a3_split_heads",
        "title": "拆分多头",
        "type": "实现",
        "difficulty": "简单",
        "description": "将特征按 head 拆分。",
        "goal": "输出 shape 为 [heads, seq, dim/heads] 的列表。",
        "constraints": ["dim 可被 heads 整除"],
        "spec": {
            "entry": "split_heads",
            "input": "x: List[List[int]], heads: int",
            "output": "List[List[List[int]]]",
            "time_limit_sec": 2,
            "precision": 4,
        },
        "starter": "def split_heads(x: list[list[int]], heads: int):\n    raise NotImplementedError\n",
        "tests": [
            {
                "args": [[[1, 2, 3, 4], [5, 6, 7, 8]], 2],
                "expected": [[[1, 2], [5, 6]], [[3, 4], [7, 8]]],
                "note": "两头拆分",
            }
        ],
        "run_count": 1,
    },
]

GENERAL_TEMPLATES: list[ProblemTemplate] = [
    {
        "id_suffix": "g1_softmax",
        "title": "Softmax",
        "type": "实现",
        "difficulty": "简单",
        "description": "实现数值稳定的 softmax。",
        "goal": "返回与输入等长的概率分布。",
        "constraints": ["结果保留 4 位小数"],
        "spec": {
            "entry": "softmax",
            "input": "scores: List[float]",
            "output": "List[float]",
            "time_limit_sec": 2,
            "precision": 4,
        },
        "starter": "def softmax(scores: list[float]):\n    raise NotImplementedError\n",
        "tests": [
            {
                "args": [[1, 2]],
                "expected": [0.2689, 0.7311],
                "note": "基础权重",
            },
            {
                "args": [[0, 0, 0]],
                "expected": [0.3333, 0.3333, 0.3333],
                "note": "全零输入",
            },
        ],
        "run_count": 1,
    },
    {
        "id_suffix": "g2_topk_indices",
        "title": "Top-K 索引",
        "type": "推理",
        "difficulty": "中等",
        "description": "返回得分最高的 K 个索引。",
        "goal": "结果按分数降序，分数相同按原序。",
        "constraints": ["k 小于等于列表长度"],
        "spec": {
            "entry": "topk_indices",
            "input": "values: List[float], k: int",
            "output": "List[int]",
            "time_limit_sec": 2,
            "precision": 4,
        },
        "starter": "def topk_indices(values: list[float], k: int):\n    raise NotImplementedError\n",
        "tests": [
            {
                "args": [[0.1, 0.9, 0.9, 0.2], 2],
                "expected": [1, 2],
                "note": "并列保持顺序",
            },
            {
                "args": [[5, 1, 3], 2],
                "expected": [0, 2],
                "note": "一般情况",
            },
        ],
        "run_count": 1,
    },
    {
        "id_suffix": "g3_cosine_similarity",
        "title": "余弦相似度",
        "type": "理解",
        "difficulty": "简单",
        "description": "计算两个向量的余弦相似度。",
        "goal": "返回一个标量相似度。",
        "constraints": ["结果保留 4 位小数"],
        "spec": {
            "entry": "cosine_similarity",
            "input": "a: List[float], b: List[float]",
            "output": "float",
            "time_limit_sec": 2,
            "precision": 4,
        },
        "starter": "def cosine_similarity(a: list[float], b: list[float]):\n    raise NotImplementedError\n",
        "tests": [
            {
                "args": [[1, 0], [0, 1]],
                "expected": 0,
                "note": "正交",
            },
            {
                "args": [[1, 2], [2, 4]],
                "expected": 1,
                "note": "同向",
            },
        ],
        "run_count": 1,
    },
]


def _load_paper_ids() -> list[str]:
    with DATA_PATH.open(encoding="utf-8") as handle:
        seeds = json.load(handle)
    return [seed["id"].replace("-", "_") for seed in seeds]


def _make_problem_id(paper_id: str, suffix: str) -> str:
    if paper_id == ATTENTION_PAPER_ID:
        return suffix
    return f"{paper_id}_{suffix}"


def build_problems() -> list[Problem]:
    problems: list[Problem] = []
    for paper_id in _load_paper_ids():
        templates = ATTENTION_TEMPLATES if paper_id == ATTENTION_PAPER_ID else GENERAL_TEMPLATES
        for template in templates:
            problems.append(
                {
                    "id": _make_problem_id(paper_id, template["id_suffix"]),
                    "paper_id": paper_id,
                    "title": template["title"],
                    "type": template["type"],
                    "difficulty": template["difficulty"],
                    "description": template["description"],
                    "goal": template["goal"],
                    "constraints": template["constraints"],
                    "spec": template["spec"],
                    "starter": template["starter"],
                    "tests": template["tests"],
                    "run_count": template["run_count"],
                }
            )
    return problems


_PROBLEMS = build_problems()


def get_problem(problem_id: str) -> Problem:
    for problem in _PROBLEMS:
        if problem["id"] == problem_id:
            return problem
    raise KeyError(f"Problem not found: {problem_id}")
