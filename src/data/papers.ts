export type Paper = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  difficulty: "入门" | "进阶" | "硬核";
};

export const papers: Paper[] = [
  {
    id: "attention",
    title: "注意力机制",
    summary: "从打分到权重，完整复现核心公式。",
    tags: ["NLP", "Transformer"],
    difficulty: "入门",
  },
];

export const allTags = ["NLP", "Transformer", "CV", "RL"];
