export type Card =
  | { type: "hook"; text: string }
  | { type: "intuition"; text: string }
  | { type: "method"; steps: string[] }
  | { type: "tradeoff"; good: string; bad: string }
  | { type: "who"; do: string; skip: string }
  | { type: "source"; title: string; url: string };

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

export type SeedCardFields = {
  hook: string;
  intuition: string;
  method: string[];
  tradeoff: { good: string; bad: string };
  who: { do: string; skip: string };
};

export type SeedPaper = {
  id: string;
  title: string;
  topic: string;
  source: Source;
  cards: SeedCardFields;
};
