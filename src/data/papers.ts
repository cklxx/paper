export type Card =
  | { type: "hook"; text: string }
  | { type: "intuition"; text: string }
  | { type: "method"; steps: string[] }
  | { type: "tradeoff"; good: string; bad: string }
  | { type: "who"; do: string; skip: string };

export type Paper = {
  id: string;
  title: string;
  topic: string;
  cards: Card[];
};

export const samplePapers: Paper[] = [
  {
    id: "transformer-circuits",
    title: "Transformer Circuits",
    topic: "Inference",
    cards: [
      { type: "hook", text: "Transformer 里藏着可拆的思维线路。" },
      {
        type: "intuition",
        text: "直觉：注意力全局随机；作者：特定头负责特定推理链。",
      },
      {
        type: "method",
        steps: [
          "标记重复出现的注意力模式",
          "把它们当“电路”拆出来",
          "用来解释输出",
        ],
      },
      {
        type: "tradeoff",
        good: "可解释性↑",
        bad: "复杂任务电路重叠，拆不干净",
      },
      {
        type: "who",
        do: "做模型解释/安全",
        skip: "只关心下游指标",
      },
    ],
  },
  {
    id: "flashattention",
    title: "FlashAttention",
    topic: "Training",
    cards: [
      { type: "hook", text: "真慢的不是算力，是显存来回搬。" },
      {
        type: "intuition",
        text: "直觉：算子本身慢；作者：IO 是瓶颈。",
      },
      {
        type: "method",
        steps: ["块化注意力", "在 SRAM 里完成算子", "减少 DRAM 往返"],
      },
      {
        type: "tradeoff",
        good: "吞吐大涨",
        bad: "需要硬件友好实现",
      },
      {
        type: "who",
        do: "GPU 推理/训练优化",
        skip: "CPU-only 轻量场景",
      },
    ],
  },
  {
    id: "speculative-decoding",
    title: "Speculative Decoding",
    topic: "Inference",
    cards: [
      { type: "hook", text: "推理慢，因为一次只敢猜一个 token。" },
      {
        type: "intuition",
        text: "直觉：大模型要谨慎；作者：小模型先粗猜，大模型批验证。",
      },
      {
        type: "method",
        steps: ["小模型并行猜多 token", "大模型一次性批判对", "只重算错的部分"],
      },
      {
        type: "tradeoff",
        good: "延迟↓",
        bad: "依赖先验模型，场景切换要重训小模型",
      },
      {
        type: "who",
        do: "要求低延迟",
        skip: "只离线跑批",
      },
    ],
  },
];
