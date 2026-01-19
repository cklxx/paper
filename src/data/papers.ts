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
