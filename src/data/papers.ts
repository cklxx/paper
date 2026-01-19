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
  description: string;
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

export const paperTagStyles: Record<string, string> = {
  "自然语言": "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  "视觉": "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  "注意力": "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  "循环网络": "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  "卷积": "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
  "推理": "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20",
  "对抗生成": "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20",
  "变分自编码": "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20",
  "强化学习": "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  "表示学习": "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20",
  "嵌入": "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
  "高效训练": "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20",
  "微调": "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20",
  "参数高效": "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20",
  "低秩": "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20",
  "目标检测": "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  "开放词表": "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20",
  "预训练": "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
  "语义分割": "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
  "实例分割": "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
  "多模态": "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20",
  "对齐": "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
  "自监督": "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20",
  "生成": "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20",
  "扩散": "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20",
  "3D": "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  "图表示": "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20",
  "大模型": "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20",
  "优化": "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
  "检索": "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
};

export const paperFilterStyles: Record<string, string> = {
  "自然语言": "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20",
  "视觉": "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20",
  "注意力": "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20",
  "循环网络": "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20",
  "卷积": "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20",
  "推理": "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 border-pink-500/20",
  "对抗生成": "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20",
  "变分自编码": "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-indigo-500/20",
  "强化学习": "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20",
  "表示学习": "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 border-cyan-500/20",
  "嵌入": "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20",
  "高效训练": "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 border-violet-500/20",
  "微调": "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 border-violet-500/20",
  "参数高效": "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 border-violet-500/20",
  "低秩": "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 border-violet-500/20",
  "目标检测": "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20",
  "开放词表": "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 border-cyan-500/20",
  "预训练": "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20",
  "语义分割": "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20",
  "实例分割": "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20",
  "多模态": "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 border-cyan-500/20",
  "对齐": "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20",
  "自监督": "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 border-violet-500/20",
  "生成": "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20",
  "扩散": "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-indigo-500/20",
  "3D": "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20",
  "图表示": "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 border-cyan-500/20",
  "大模型": "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 border-violet-500/20",
  "优化": "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20",
  "检索": "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20",
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
  attention_is_all_you_need: "注意力就是一切",
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
  const summary = seed.cards.hook;
  const tags = topicTagMap[seed.topic] ?? ["通用"];
  const title = titleOverrides[id] ?? makeTitle(summary, seed.title);
  return {
    id,
    title,
    summary,
    description: summary,
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
