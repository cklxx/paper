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
