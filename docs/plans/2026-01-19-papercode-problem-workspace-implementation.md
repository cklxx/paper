# PaperCode Problem Workspace Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the paper detail + problem workspace flow with a Python run/submit backend, local progress, and 1:1 UI/interaction per the approved design.

**Architecture:** Frontend uses static data from `data/paper_seeds.json` plus generated problem templates, renders paper detail and problem workspace pages, and persists progress + drafts in localStorage. Backend adds FastAPI endpoints that evaluate submitted Python code inside a temporary directory using a JSON runner with resource limits.

**Tech Stack:** Vite + React + TypeScript, React Router, react-resizable-panels, @monaco-editor/react, FastAPI, pytest, Vitest.

---

### Task 1: Expand paper data from seeds

**Files:**
- Modify: `src/__tests__/papers.test.tsx`
- Modify: `src/data/papers.ts`

**Step 1: Write the failing test**

```tsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import Papers from "../pages/Papers";
import { renderWithRouter } from "../test-utils";

it("filters papers by search", async () => {
  renderWithRouter(<Papers />);
  const input = screen.getByPlaceholderText("搜索论文、标签...");
  await userEvent.type(input, "注意力");
  expect(await screen.findByText("注意力架构")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/papers.test.tsx`
Expected: FAIL because `papers.ts` still has the old single-item data.

**Step 3: Write minimal implementation**

```ts
import seeds from "../../data/paper_seeds.json";

type Seed = {
  id: string;
  title: string;
  topic: string;
  source: {
    title: string;
    url: string;
  };
  cards: {
    hook: string;
    intuition: string;
    method: string[];
    tradeoff: { good: string; bad: string };
    who: { do: string; skip: string };
  };
};

export type Paper = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  difficulty: "入门" | "进阶" | "硬核";
  year?: number;
  authors: string[];
  venue?: string;
  source: {
    title: string;
    url: string;
  };
};

const topicTagMap: Record<string, string[]> = {
  Alignment: ["对齐"],
  Architecture: ["架构", "Transformer"],
  Code: ["代码"],
  Evaluation: ["评测"],
  Inference: ["推理", "加速"],
  Multimodal: ["多模态"],
  Pretraining: ["预训练"],
  Prompting: ["提示"],
  Reasoning: ["推理"],
  Retrieval: ["检索"],
  Safety: ["安全"],
  Scaling: ["扩展"],
  Systems: ["系统"],
  Tools: ["工具"],
  Training: ["训练", "微调"],
  Vision: ["视觉"],
};

const difficultyMap: Record<string, Paper["difficulty"]> = {
  Architecture: "进阶",
  Training: "进阶",
  Alignment: "进阶",
  Inference: "入门",
  Vision: "进阶",
  Retrieval: "入门",
  Pretraining: "进阶",
  Scaling: "硬核",
  Systems: "硬核",
  Safety: "进阶",
  Reasoning: "进阶",
  Prompting: "入门",
  Tools: "入门",
  Evaluation: "入门",
  Code: "入门",
  Multimodal: "进阶",
};

const titleOverrides: Record<string, string> = {
  attention_is_all_you_need: "注意力架构",
};

const toPaperId = (seedId: string) => seedId.replace(/-/g, "_");

const makeTitle = (hook: string, fallback: string) => {
  const cut = hook.split("，")[0].split("。")[0].trim();
  return cut || fallback;
};

const parseAuthors = (sourceTitle: string) => {
  const [authors] = sourceTitle.split(",");
  return authors ? [authors.trim()] : [];
};

const parseVenue = (sourceTitle: string) => {
  const [, ...rest] = sourceTitle.split(",");
  const venue = rest.join(",").trim();
  return venue || undefined;
};

const parseYear = (sourceTitle: string) => {
  const match = sourceTitle.match(/(19|20)\d{2}/);
  return match ? Number(match[0]) : undefined;
};

export const papers: Paper[] = (seeds as Seed[]).map((seed) => {
  const id = toPaperId(seed.id);
  const tags = topicTagMap[seed.topic] ?? ["通用"];
  const title = titleOverrides[id] ?? makeTitle(seed.cards.hook, seed.title);
  return {
    id,
    title,
    summary: seed.cards.hook,
    tags,
    difficulty: difficultyMap[seed.topic] ?? "进阶",
    year: parseYear(seed.source.title),
    authors: parseAuthors(seed.source.title),
    venue: parseVenue(seed.source.title),
    source: seed.source,
  };
});

export const allTags = Array.from(new Set(papers.flatMap((paper) => paper.tags)));

export const findPaperById = (paperId: string) =>
  papers.find((paper) => paper.id === paperId);
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/papers.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/__tests__/papers.test.tsx src/data/papers.ts
git commit -m "feat: load papers from seed data"
```

---

### Task 2: Add problem registry + helpers (frontend)

**Files:**
- Create: `src/__tests__/problems.test.ts`
- Create: `src/data/problems.ts`

**Step 1: Write the failing test**

```ts
import { expect, it } from "vitest";
import { getProblemById, getProblemsForPaperId } from "../data/problems";

it("returns attention tasks", () => {
  const problems = getProblemsForPaperId("attention_is_all_you_need");
  expect(problems.some((problem) => problem.id === "a1_positional_encoding")).toBe(true);
});

it("finds problem by id", () => {
  const problem = getProblemById("attention_is_all_you_need", "a1_positional_encoding");
  expect(problem?.spec.entry).toBe("positional_encoding");
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/problems.test.ts`
Expected: FAIL because `problems.ts` does not exist.

**Step 3: Write minimal implementation**

```ts
import { papers } from "./papers";

export type ProblemType = "实现" | "理解" | "推理";
export type ProblemDifficulty = "简单" | "中等" | "困难";

export type ProblemSpec = {
  entry: string;
  input: string;
  output: string;
  timeLimitSec: number;
  precision: number;
};

export type ProblemTest = {
  args: unknown[];
  expected: unknown;
  note?: string;
};

export type Problem = {
  id: string;
  paperId: string;
  title: string;
  type: ProblemType;
  difficulty: ProblemDifficulty;
  description: string;
  goal: string;
  constraints: string[];
  spec: ProblemSpec;
  starter: string;
  tests: ProblemTest[];
  runCount: number;
};

type ProblemTemplate = Omit<Problem, "id" | "paperId"> & { idSuffix: string };

const attentionPaperId = "attention_is_all_you_need";

const attentionTemplates: ProblemTemplate[] = [
  {
    idSuffix: "a1_positional_encoding",
    title: "位置编码",
    type: "实现",
    difficulty: "中等",
    description: "实现正弦位置编码矩阵。",
    goal: "返回长度为 max_len 的位置编码矩阵。",
    constraints: ["d_model 为偶数", "使用 sin/cos 公式"],
    spec: {
      entry: "positional_encoding",
      input: "max_len: int, d_model: int",
      output: "List[List[float]]",
      timeLimitSec: 2,
      precision: 4,
    },
    starter: "def positional_encoding(max_len: int, d_model: int):\n    raise NotImplementedError\n",
    tests: [
      {
        args: [1, 4],
        expected: [[0, 1, 0, 1]],
        note: "最小形态",
      },
      {
        args: [2, 2],
        expected: [[0, 1], [0.8415, 0.5403]],
        note: "前两步",
      },
    ],
    runCount: 1,
  },
  {
    idSuffix: "a2_scaled_dot_attention",
    title: "注意力权重",
    type: "理解",
    difficulty: "中等",
    description: "计算缩放点积注意力权重。",
    goal: "返回每个 key 的 softmax 权重。",
    constraints: ["使用缩放系数 1/sqrt(d)", "softmax 输出保留 4 位小数"],
    spec: {
      entry: "attention_weights",
      input: "query: List[float], keys: List[List[float]]",
      output: "List[float]",
      timeLimitSec: 2,
      precision: 4,
    },
    starter: "def attention_weights(query: list[float], keys: list[list[float]]):\n    raise NotImplementedError\n",
    tests: [
      {
        args: [[1, 0], [[1, 0], [0, 1]]],
        expected: [0.6698, 0.3302],
        note: "正交 key",
      },
      {
        args: [[1, 1], [[1, 0], [0, 1]]],
        expected: [0.5, 0.5],
        note: "对称情况",
      },
    ],
    runCount: 1,
  },
  {
    idSuffix: "a3_split_heads",
    title: "拆分多头",
    type: "实现",
    difficulty: "简单",
    description: "将特征按 head 拆分。",
    goal: "输出 shape 为 [heads, seq, dim/heads] 的列表。",
    constraints: ["dim 可被 heads 整除"],
    spec: {
      entry: "split_heads",
      input: "x: List[List[int]], heads: int",
      output: "List[List[List[int]]]",
      timeLimitSec: 2,
      precision: 4,
    },
    starter: "def split_heads(x: list[list[int]], heads: int):\n    raise NotImplementedError\n",
    tests: [
      {
        args: [[[1, 2, 3, 4], [5, 6, 7, 8]], 2],
        expected: [[[1, 2], [5, 6]], [[3, 4], [7, 8]]],
        note: "两头拆分",
      },
    ],
    runCount: 1,
  },
];

const generalTemplates: ProblemTemplate[] = [
  {
    idSuffix: "g1_softmax",
    title: "Softmax",
    type: "实现",
    difficulty: "简单",
    description: "实现数值稳定的 softmax。",
    goal: "返回与输入等长的概率分布。",
    constraints: ["结果保留 4 位小数"],
    spec: {
      entry: "softmax",
      input: "scores: List[float]",
      output: "List[float]",
      timeLimitSec: 2,
      precision: 4,
    },
    starter: "def softmax(scores: list[float]):\n    raise NotImplementedError\n",
    tests: [
      {
        args: [[1, 2]],
        expected: [0.2689, 0.7311],
        note: "基础权重",
      },
      {
        args: [[0, 0, 0]],
        expected: [0.3333, 0.3333, 0.3333],
        note: "全零输入",
      },
    ],
    runCount: 1,
  },
  {
    idSuffix: "g2_topk_indices",
    title: "Top-K 索引",
    type: "推理",
    difficulty: "中等",
    description: "返回得分最高的 K 个索引。",
    goal: "结果按分数降序，分数相同按原序。",
    constraints: ["k 小于等于列表长度"],
    spec: {
      entry: "topk_indices",
      input: "values: List[float], k: int",
      output: "List[int]",
      timeLimitSec: 2,
      precision: 4,
    },
    starter: "def topk_indices(values: list[float], k: int):\n    raise NotImplementedError\n",
    tests: [
      {
        args: [[0.1, 0.9, 0.9, 0.2], 2],
        expected: [1, 2],
        note: "并列保持顺序",
      },
      {
        args: [[5, 1, 3], 2],
        expected: [0, 2],
        note: "一般情况",
      },
    ],
    runCount: 1,
  },
  {
    idSuffix: "g3_cosine_similarity",
    title: "余弦相似度",
    type: "理解",
    difficulty: "简单",
    description: "计算两个向量的余弦相似度。",
    goal: "返回一个标量相似度。",
    constraints: ["结果保留 4 位小数"],
    spec: {
      entry: "cosine_similarity",
      input: "a: List[float], b: List[float]",
      output: "float",
      timeLimitSec: 2,
      precision: 4,
    },
    starter: "def cosine_similarity(a: list[float], b: list[float]):\n    raise NotImplementedError\n",
    tests: [
      {
        args: [[1, 0], [0, 1]],
        expected: 0,
        note: "正交",
      },
      {
        args: [[1, 2], [2, 4]],
        expected: 1,
        note: "同向",
      },
    ],
    runCount: 1,
  },
];

const makeProblemId = (paperId: string, suffix: string) =>
  paperId === attentionPaperId ? suffix : `${paperId}_${suffix}`;

export const problems: Problem[] = papers.flatMap((paper) => {
  const templates = paper.id === attentionPaperId ? attentionTemplates : generalTemplates;
  return templates.map((template) => ({
    ...template,
    id: makeProblemId(paper.id, template.idSuffix),
    paperId: paper.id,
  }));
});

export const getProblemsForPaperId = (paperId: string) =>
  problems.filter((problem) => problem.paperId === paperId);

export const getProblemById = (paperId: string, problemId: string) =>
  problems.find((problem) => problem.paperId === paperId && problem.id === problemId);

export const problemTypeStyles: Record<ProblemType, string> = {
  实现: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  理解: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  推理: "border-amber-500/30 bg-amber-500/10 text-amber-300",
};

export const difficultyStyles: Record<ProblemDifficulty, string> = {
  简单: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  中等: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  困难: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/problems.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/__tests__/problems.test.ts src/data/problems.ts
git commit -m "feat: add problem registry"
```

---

### Task 3: Add progress hook

**Files:**
- Create: `src/__tests__/progress.test.ts`
- Create: `src/hooks/useProgress.ts`

**Step 1: Write the failing test**

```ts
import { expect, it } from "vitest";
import { getProgressCounts } from "../hooks/useProgress";

it("computes progress counts", () => {
  const progress = {
    paper_a: { task_1: true, task_2: false },
  };
  const counts = getProgressCounts(progress, "paper_a", ["task_1", "task_2", "task_3"]);
  expect(counts).toEqual({ completed: 1, total: 3 });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/progress.test.ts`
Expected: FAIL because `useProgress.ts` does not exist.

**Step 3: Write minimal implementation**

```ts
import { useCallback } from "react";
import { getProblemsForPaperId } from "../data/problems";
import { useLocalStorageState } from "./useLocalStorageState";

export type ProgressMap = Record<string, Record<string, boolean>>;

export const getProgressCounts = (
  progress: ProgressMap,
  paperId: string,
  problemIds: string[],
) => {
  const completed = problemIds.filter((id) => progress[paperId]?.[id]).length;
  return { completed, total: problemIds.length };
};

export function useProgress() {
  const [progress, setProgress] = useLocalStorageState<ProgressMap>("pc.progress", {});

  const markComplete = useCallback(
    (paperId: string, problemId: string) => {
      setProgress((current) => {
        const paperProgress = { ...(current[paperId] ?? {}) };
        paperProgress[problemId] = true;
        return { ...current, [paperId]: paperProgress };
      });
    },
    [setProgress],
  );

  const isComplete = useCallback(
    (paperId: string, problemId: string) => Boolean(progress[paperId]?.[problemId]),
    [progress],
  );

  const getCounts = useCallback(
    (paperId: string) => {
      const problems = getProblemsForPaperId(paperId);
      return getProgressCounts(
        progress,
        paperId,
        problems.map((problem) => problem.id),
      );
    },
    [progress],
  );

  return { progress, markComplete, isComplete, getCounts };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/progress.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/__tests__/progress.test.ts src/hooks/useProgress.ts
git commit -m "feat: add progress storage"
```

---

### Task 4: Add backend problem registry + evaluator

**Files:**
- Create: `backend/tests/test_judge.py`
- Create: `backend/problems.py`
- Create: `backend/evaluator.py`

**Step 1: Write the failing test**

```python
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
```

**Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_judge.py -v`
Expected: FAIL because evaluator/problem registry do not exist.

**Step 3: Write minimal implementation**

```python
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
```

```python
from __future__ import annotations

import json
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Any

from .problems import Problem

RUNNER_SOURCE = """
import importlib.util
import json
import math
import traceback


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
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()
"""


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
                ["python", "-I", "runner.py"],
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
```

**Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_judge.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/tests/test_judge.py backend/problems.py backend/evaluator.py
git commit -m "feat: add backend judge runner"
```

---

### Task 5: Add run/submit API endpoints

**Files:**
- Create: `backend/schemas.py`
- Modify: `backend/main.py`
- Modify: `backend/tests/test_api.py`

**Step 1: Write the failing test**

```python
def test_run_problem_endpoint(client):
    code = """
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
    response = client.post(
        "/api/run",
        json={
            "paper_id": "attention_is_all_you_need",
            "problem_id": "a1_positional_encoding",
            "code": code,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["total"] == 1


def test_submit_problem_endpoint(client):
    code = """
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
    response = client.post(
        "/api/submit",
        json={
            "paper_id": "attention_is_all_you_need",
            "problem_id": "a1_positional_encoding",
            "code": code,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["total"] == 2
```

**Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_api.py -v`
Expected: FAIL because `/api/run` and `/api/submit` are missing.

**Step 3: Write minimal implementation**

```python
from typing import Any, Literal

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
```

```python
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .crawler import PaperCrawler
from .data import load_sample_papers
from .database import (
    fetch_paper,
    init_db,
    list_papers as fetch_all_papers,
    upsert_papers,
)
from .evaluator import run_problem
from .models import Paper
from .problems import get_problem
from .schemas import RunRequest, RunResponse

class CrawlRequest(BaseModel):
    url: str
    topic: str


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    upsert_papers(load_sample_papers())
    yield


app = FastAPI(title="Paper Swipe API", version="0.1.0", lifespan=lifespan)
crawler = PaperCrawler()


@app.get("/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/papers", response_model=list[Paper], tags=["papers"])
def list_papers_endpoint() -> list[Paper]:
    return fetch_all_papers()


@app.get("/papers/{paper_id}", response_model=Paper, tags=["papers"])
def get_paper(paper_id: str) -> Paper:
    paper = fetch_paper(paper_id)
    if paper is None:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper


@app.post("/crawl", response_model=Paper, tags=["crawler"])
def crawl_paper(request: CrawlRequest) -> Paper:
    try:
        paper = crawler.crawl(request.url, request.topic)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    upsert_papers([paper])
    return paper


@app.post("/api/run", response_model=RunResponse, tags=["judge"])
def run_endpoint(payload: RunRequest) -> RunResponse:
    try:
        problem = get_problem(payload.problem_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Problem not found")
    if problem["paper_id"] != payload.paper_id:
        raise HTTPException(status_code=404, detail="Problem not found")
    result = run_problem(problem, payload.code, run_all=False)
    return RunResponse(**result)


@app.post("/api/submit", response_model=RunResponse, tags=["judge"])
def submit_endpoint(payload: RunRequest) -> RunResponse:
    try:
        problem = get_problem(payload.problem_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Problem not found")
    if problem["paper_id"] != payload.paper_id:
        raise HTTPException(status_code=404, detail="Problem not found")
    result = run_problem(problem, payload.code, run_all=True)
    return RunResponse(**result)
```

**Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_api.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/schemas.py backend/main.py backend/tests/test_api.py
git commit -m "feat: add run/submit API"
```

---

### Task 6: Add API client + paper detail page

**Files:**
- Create: `src/__tests__/paper-detail.test.tsx`
- Create: `src/api/judge.ts`
- Create: `src/pages/PaperDetail.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/PaperCard.tsx`
- Modify: `src/pages/Papers.tsx`

**Step 1: Write the failing test**

```tsx
import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import PaperDetail from "../pages/PaperDetail";
import { renderWithRouter } from "../test-utils";

it("renders attention tasks", () => {
  renderWithRouter(<PaperDetail />, {
    route: "/papers/attention_is_all_you_need",
    path: "/papers/:paperId",
  });
  expect(screen.getByText("位置编码")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/paper-detail.test.tsx`
Expected: FAIL because `PaperDetail` does not exist.

**Step 3: Write minimal implementation**

```ts
const apiBase = import.meta.env.VITE_API_BASE ?? "";

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return (await response.json()) as T;
}

export type RunPayload = {
  paperId: string;
  problemId: string;
  code: string;
};

export type RunResult = {
  status: "ok" | "error" | "timeout";
  passed: number;
  failed: number;
  total: number;
  duration: number;
  output: string;
  error: string;
  cases: Array<{
    ok: boolean;
    args: unknown[];
    expected: unknown;
    output: unknown;
    error?: string;
  }>;
};

export const runProblem = (payload: RunPayload) =>
  postJson<RunResult>("/api/run", {
    paper_id: payload.paperId,
    problem_id: payload.problemId,
    code: payload.code,
  });

export const submitProblem = (payload: RunPayload) =>
  postJson<RunResult>("/api/submit", {
    paper_id: payload.paperId,
    problem_id: payload.problemId,
    code: payload.code,
  });
```

```tsx
import { Link, useParams } from "react-router-dom";
import { findPaperById } from "../data/papers";
import {
  difficultyStyles,
  getProblemsForPaperId,
  problemTypeStyles,
} from "../data/problems";
import { useProgress } from "../hooks/useProgress";

const formatIndex = (index: number) => String(index + 1).padStart(2, "0");

export default function PaperDetail() {
  const { paperId } = useParams();
  const paper = paperId ? findPaperById(paperId) : undefined;
  const problems = paperId ? getProblemsForPaperId(paperId) : [];
  const { isComplete } = useProgress();

  if (!paper) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-muted-foreground">论文不存在。</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <div className="flex items-center gap-3">
        <Link
          to="/papers"
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          ← 返回论文列表
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{paper.title}</h1>
          {paper.year ? (
            <span className="text-xs px-2 py-1 rounded-full border border-white/10 text-muted-foreground">
              {paper.year}
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {paper.authors.map((author) => (
            <span
              key={author}
              className="text-xs px-2 py-1 rounded-full border border-white/10 text-muted-foreground"
            >
              {author}
            </span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground max-w-3xl">{paper.summary}</p>
        <a
          href={paper.source.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-white/10 hover:bg-white/5 w-fit"
        >
          阅读原文
        </a>
      </div>

      <div className="mt-10 flex items-center gap-3">
        <h2 className="text-lg font-semibold">实现路径</h2>
        <span className="text-xs px-2 py-1 rounded-full border border-white/10 text-muted-foreground">
          {problems.length} 个任务
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        {problems.map((problem, index) => {
          const completed = isComplete(problem.paperId, problem.id);
          return (
            <Link
              key={problem.id}
              to={`/papers/${problem.paperId}/problems/${problem.id}`}
              className={`glass p-5 rounded-xl border border-white/10 transition hover:border-white/20 flex items-start gap-4 ${
                completed ? "bg-muted/10 border-emerald-500/30" : ""
              }`}
            >
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Task {formatIndex(index)}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold">{problem.title}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${problemTypeStyles[problem.type]}`}
                  >
                    {problem.type}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${difficultyStyles[problem.difficulty]}`}
                  >
                    {problem.difficulty}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{problem.description}</p>
              </div>
              <div className="ml-auto">
                {completed ? (
                  <span className="text-emerald-400">●</span>
                ) : (
                  <span className="text-muted-foreground">○</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

```tsx
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Papers from "./pages/Papers";
import Roadmap from "./pages/Roadmap";
import Reviews from "./pages/Reviews";
import Sponsors from "./pages/Sponsors";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import PaperDetail from "./pages/PaperDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="papers" element={<Papers />} />
        <Route path="papers/:paperId" element={<PaperDetail />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="sponsors" element={<Sponsors />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
```

```tsx
import { Link } from "react-router-dom";
import type { Paper } from "../data/papers";

type Progress = {
  completed: number;
  total: number;
};

export default function PaperCard({
  paper,
  progress,
}: {
  paper: Paper;
  progress?: Progress;
}) {
  const percent = progress && progress.total ? (progress.completed / progress.total) * 100 : 0;

  return (
    <Link
      to={`/papers/${paper.id}`}
      className="glass p-6 rounded-xl border border-white/10 hover-lift block"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{paper.title}</h3>
        <span className="text-xs text-muted-foreground">{paper.difficulty}</span>
      </div>
      <p className="text-sm text-muted-foreground">{paper.summary}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {paper.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs text-muted-foreground border border-white/10 rounded-full px-2 py-1"
          >
            {tag}
          </span>
        ))}
      </div>
      {progress ? (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>进度</span>
            <span>
              {progress.completed}/{progress.total}
            </span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-white/10">
            <div className="h-1 rounded-full bg-emerald-400" style={{ width: `${percent}%` }} />
          </div>
        </div>
      ) : null}
    </Link>
  );
}
```

```tsx
import { useMemo } from "react";
import PaperCard from "../components/PaperCard";
import { allTags, papers } from "../data/papers";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { useProgress } from "../hooks/useProgress";

export default function Papers() {
  const [query, setQuery] = useLocalStorageState("pc.search", "");
  const [activeTags, setActiveTags] = useLocalStorageState<string[]>("pc.filters", []);
  const { getCounts } = useProgress();

  const filtered = useMemo(() => {
    return papers.filter((paper) => {
      const matchesQuery = query
        ? paper.title.includes(query) ||
          paper.summary.includes(query) ||
          paper.tags.some((tag) => tag.includes(query))
        : true;
      const matchesTags = activeTags.length
        ? activeTags.every((tag) => paper.tags.includes(tag))
        : true;
      return matchesQuery && matchesTags;
    });
  }, [query, activeTags]);

  const toggleTag = (tag: string) => {
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">论文</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">挑一篇，边写边学。</p>
        </div>
        <div className="relative w-full">
          <input
            className="w-full rounded-md border px-3 py-1 text-base shadow-xs outline-none pl-10 h-10 bg-muted/30 border-white/10"
            placeholder="搜索论文、标签..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">筛选：</span>
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`text-xs rounded-full px-3 py-1 border ${
                activeTags.includes(tag)
                  ? "bg-primary text-primary-foreground"
                  : "border-white/10 text-muted-foreground"
              }`}
              onClick={() => toggleTag(tag)}
              type="button"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filtered.map((paper) => (
          <PaperCard key={paper.id} paper={paper} progress={getCounts(paper.id)} />
        ))}
      </div>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/paper-detail.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/__tests__/paper-detail.test.tsx src/api/judge.ts src/pages/PaperDetail.tsx src/App.tsx src/components/PaperCard.tsx src/pages/Papers.tsx
git commit -m "feat: add paper detail and api client"
```

---

### Task 7: Add problem workspace page + layout updates

**Files:**
- Create: `src/__tests__/paper-problem.test.tsx`
- Create: `src/pages/PaperProblem.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Layout.tsx`
- Modify: `vite.config.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Step 1: Write the failing test**

```tsx
import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import PaperProblem from "../pages/PaperProblem";
import { renderWithRouter } from "../test-utils";

it("renders the problem title", () => {
  renderWithRouter(<PaperProblem />, {
    route: "/papers/attention_is_all_you_need/problems/a1_positional_encoding",
    path: "/papers/:paperId/problems/:problemId",
  });
  expect(screen.getByText("位置编码")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/paper-problem.test.tsx`
Expected: FAIL because `PaperProblem` does not exist.

**Step 3: Write minimal implementation**

```tsx
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Editor from "@monaco-editor/react";
import { findPaperById } from "../data/papers";
import { difficultyStyles, getProblemById } from "../data/problems";
import { runProblem, submitProblem } from "../api/judge";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { useProgress } from "../hooks/useProgress";

const tabStyles = (active: boolean) =>
  `px-3 py-2 text-sm rounded-md border ${
    active ? "border-white/20 bg-white/5" : "border-transparent text-muted-foreground"
  }`;

type OutputCase = {
  ok: boolean;
  args: unknown[];
  expected: unknown;
  output: unknown;
  error?: string;
};

type RunResult = {
  status: "ok" | "error" | "timeout";
  passed: number;
  failed: number;
  total: number;
  duration: number;
  output: string;
  error: string;
  cases: OutputCase[];
};

export default function PaperProblem() {
  const { paperId, problemId } = useParams();
  const paper = paperId ? findPaperById(paperId) : undefined;
  const problem = paperId && problemId ? getProblemById(paperId, problemId) : undefined;
  const { markComplete } = useProgress();
  const [activeTab, setActiveTab] = useState<"desc" | "output">("desc");
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [panelSizes, setPanelSizes] = useLocalStorageState<number[]>("pc.panels.problem", [40, 60]);

  const [code, setCode] = useLocalStorageState(
    problem ? `pc.code.${problem.id}` : "pc.code.unknown",
    problem?.starter ?? "",
  );

  const hasProblem = Boolean(problem && paper);

  const progress = useMemo(() => {
    if (!result || result.total === 0) return 0;
    return Math.round((result.passed / result.total) * 100);
  }, [result]);

  if (!hasProblem) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-muted-foreground">题目不存在。</p>
      </div>
    );
  }

  const handleRun = async () => {
    if (!paperId || !problemId) return;
    setRunning(true);
    try {
      const payload = await runProblem({ paperId, problemId, code });
      setResult(payload);
      setActiveTab("output");
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!paperId || !problemId) return;
    setSubmitting(true);
    try {
      const payload = await submitProblem({ paperId, problemId, code });
      setResult(payload);
      setActiveTab("output");
      if (payload.status === "ok" && payload.failed === 0) {
        markComplete(paperId, problemId);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 top-14 z-40 bg-background">
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-white/10">
          <Link
            to={`/papers/${paperId}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← 返回
          </Link>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{problem.title}</span>
            <span
              className={`text-xs px-2 py-1 rounded-full border ${difficultyStyles[problem.difficulty]}`}
            >
              {problem.difficulty}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              className="px-3 py-2 text-sm rounded-md border border-white/10 hover:bg-white/5 disabled:opacity-60"
              type="button"
              onClick={handleRun}
              disabled={running}
            >
              {running ? "运行中..." : "运行"}
            </button>
            <button
              className="px-3 py-2 text-sm rounded-md border border-white/10 bg-white/10 hover:bg-white/20 disabled:opacity-60"
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "提交中..." : "提交"}
            </button>
          </div>
        </div>

        <PanelGroup
          direction="horizontal"
          className="flex-1"
          onLayout={(sizes) => setPanelSizes(sizes)}
        >
          <Panel defaultSize={panelSizes[0]} minSize={25} className="bg-background">
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
                <button
                  className={tabStyles(activeTab === "desc")}
                  type="button"
                  onClick={() => setActiveTab("desc")}
                >
                  说明
                </button>
                <button
                  className={tabStyles(activeTab === "output")}
                  type="button"
                  onClick={() => setActiveTab("output")}
                >
                  输出
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                {activeTab === "desc" ? (
                  <div className="space-y-4 text-sm">
                    <p className="text-muted-foreground">{problem.description}</p>
                    <div>
                      <h3 className="text-sm font-semibold">目标</h3>
                      <p className="text-muted-foreground">{problem.goal}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">约束</h3>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {problem.constraints.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">规格</h3>
                      <div className="text-muted-foreground">
                        <div>入口函数：{problem.spec.entry}</div>
                        <div>输入：{problem.spec.input}</div>
                        <div>输出：{problem.spec.output}</div>
                        <div>时间限制：{problem.spec.timeLimitSec}s</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">公开用例</h3>
                      <div className="space-y-2 text-muted-foreground">
                        {problem.tests.map((testCase, index) => (
                          <div key={String(index)} className="border border-white/10 rounded-md p-2">
                            <div>用例 {index + 1}：{testCase.note ?? ""}</div>
                            <div>输入：{JSON.stringify(testCase.args)}</div>
                            <div>期望：{JSON.stringify(testCase.expected)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-sm">
                    {result ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            通过 {result.passed} / {result.total}
                          </span>
                          <span className="text-muted-foreground">{result.duration.toFixed(2)}s</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="space-y-2">
                          {result.cases.map((caseItem, index) => (
                            <div
                              key={String(index)}
                              className={`border rounded-md p-2 ${
                                caseItem.ok ? "border-emerald-500/30" : "border-rose-500/30"
                              }`}
                            >
                              <div className="text-xs text-muted-foreground">
                                用例 {index + 1} {caseItem.ok ? "通过" : "失败"}
                              </div>
                              <div>输入：{JSON.stringify(caseItem.args)}</div>
                              <div>输出：{JSON.stringify(caseItem.output)}</div>
                              <div>期望：{JSON.stringify(caseItem.expected)}</div>
                              {caseItem.error ? (
                                <pre className="mt-2 text-xs text-rose-400 whitespace-pre-wrap">
                                  {caseItem.error}
                                </pre>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground">暂无运行结果。</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-white/5 hover:bg-white/10 transition" />

          <Panel defaultSize={panelSizes[1]} minSize={35} className="bg-[#1e1e1e]">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value ?? "")}
              options={{
                minimap: { enabled: false },
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
              }}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
```

```tsx
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import PageTransition from "./PageTransition";

export default function Layout() {
  const location = useLocation();
  const hideFooter = location.pathname.includes("/problems/");

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.body.classList.add("antialiased", "min-h-screen", "bg-background", "text-foreground");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <PageTransition>
        <Outlet />
      </PageTransition>
      {hideFooter ? null : <Footer />}
    </div>
  );
}
```

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const githubPagesBase = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "paper";

export default defineConfig(({ mode }) => ({
  base: mode === "github-pages" ? `/${githubPagesBase}/` : "/",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 4173,
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
}));
```

```json
{
  "dependencies": {
    "@monaco-editor/react": "^4.6.0",
    "react-resizable-panels": "^2.1.7"
  }
}
```

Run: `npm install`

```tsx
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Papers from "./pages/Papers";
import Roadmap from "./pages/Roadmap";
import Reviews from "./pages/Reviews";
import Sponsors from "./pages/Sponsors";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import PaperDetail from "./pages/PaperDetail";
import PaperProblem from "./pages/PaperProblem";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="papers" element={<Papers />} />
        <Route path="papers/:paperId" element={<PaperDetail />} />
        <Route path="papers/:paperId/problems/:problemId" element={<PaperProblem />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="sponsors" element={<Sponsors />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/paper-problem.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/__tests__/paper-problem.test.tsx src/pages/PaperProblem.tsx src/components/Layout.tsx src/App.tsx vite.config.ts package.json package-lock.json
git commit -m "feat: add problem workspace"
```

---

Plan complete and saved to `docs/plans/2026-01-19-papercode-problem-workspace-implementation.md`. Two execution options:

1. Subagent-Driven (this session) - I dispatch fresh subagent per task, review between tasks, fast iteration
2. Parallel Session (separate) - Open new session with executing-plans, batch execution with checkpoints

Which approach?
