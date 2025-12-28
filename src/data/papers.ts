import type { Paper, SeedPaper } from "./types";
import { paperSeeds } from "./paperSeeds";

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

export const samplePapers: Paper[] = paperSeeds.flatMap((seed) =>
  Array.from({ length: VARIANTS_PER_SEED }).map((_, variantIndex) =>
    expandSeed(seed, variantIndex)
  )
);

export type { Paper };
