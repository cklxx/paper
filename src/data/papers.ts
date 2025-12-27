export type Card =
  | { type: "hook"; text: string }
  | { type: "intuition"; text: string }
  | { type: "method"; steps: string[] }
  | { type: "tradeoff"; good: string; bad: string }
  | { type: "who"; do: string; skip: string };

export type Source = {
  title: string;
  url: string;
};

export type Paper = {
  id: string;
  title: string;
  topic: string;
  source: Source;
  cards: Card[];
};

type SeedCardFields = {
  hook: string;
  intuition: string;
  method: string[];
  tradeoff: { good: string; bad: string };
  who: { do: string; skip: string };
};

type SeedPaper = {
  id: string;
  title: string;
  topic: string;
  source: Source;
  cards: SeedCardFields;
};

import seeds from "../../data/paper_seeds.json";

export const VARIANTS_PER_SEED = 10;

const variantText = (text: string, variantIndex: number) =>
  variantIndex === 0 ? text : `${text}（案例 ${variantIndex + 1}）`;

const variantSteps = (steps: string[], variantIndex: number) =>
  steps.map((step) =>
    variantIndex === 0 ? step : `${step} · 迭代 ${variantIndex + 1}`
  );

const expandSeed = (seed: SeedPaper, variantIndex: number): Paper => {
  const suffix = variantIndex === 0 ? "" : `-v${variantIndex + 1}`;
  return {
    id: `${seed.id}${suffix}`,
    title: `${seed.title} · 场景 ${variantIndex + 1}`,
    topic: seed.topic,
    source: seed.source,
    cards: [
      { type: "hook", text: variantText(seed.cards.hook, variantIndex) },
      {
        type: "intuition",
        text: variantText(seed.cards.intuition, variantIndex),
      },
      {
        type: "method",
        steps: variantSteps(seed.cards.method, variantIndex),
      },
      {
        type: "tradeoff",
        good: variantText(seed.cards.tradeoff.good, variantIndex),
        bad: variantText(seed.cards.tradeoff.bad, variantIndex),
      },
      {
        type: "who",
        do: variantText(seed.cards.who.do, variantIndex),
        skip: variantText(seed.cards.who.skip, variantIndex),
      },
    ],
  };
};

export const samplePapers: Paper[] = (seeds as SeedPaper[]).flatMap((seed) =>
  Array.from({ length: VARIANTS_PER_SEED }).map((_, variantIndex) =>
    expandSeed(seed, variantIndex)
  )
);
