import type { Card, Paper, SeedPaper } from "./types";
import { paperSeeds } from "./paperSeeds";

const buildCardsFromSeed = (seed: SeedPaper): Card[] => [
  { type: "hook", text: seed.cards.hook },
  { type: "intuition", text: seed.cards.intuition },
  { type: "method", steps: seed.cards.method },
  { type: "tradeoff", good: seed.cards.tradeoff.good, bad: seed.cards.tradeoff.bad },
  { type: "who", do: seed.cards.who.do, skip: seed.cards.who.skip },
  { type: "source", title: seed.source.title, url: seed.source.url },
];

const expandSeed = (seed: SeedPaper): Paper => ({
  id: seed.id,
  title: seed.title,
  topic: seed.topic,
  source: seed.source,
  cards: buildCardsFromSeed(seed),
});

export const samplePapers: Paper[] = paperSeeds.map((seed) => expandSeed(seed));

export type { Paper };
