import { describe, expect, it } from "vitest";
import seedPapers from "../../data/paper_seeds.json";
import { VARIANTS_PER_SEED, samplePapers } from "./papers";

describe("samplePapers", () => {
  it("expands every seed into demo papers", () => {
    const expectedLength = (seedPapers as unknown[]).length * VARIANTS_PER_SEED;
    expect(samplePapers).toHaveLength(expectedLength);
  });

  it("contains five cards per paper", () => {
    for (const paper of samplePapers) {
      expect(paper.cards).toHaveLength(5);
    }
  });

  it("keeps topics labeled", () => {
    const topics = new Set(samplePapers.map((paper) => paper.topic));
    expect(topics.size).toBeGreaterThan(1);
  });

  it("carries source metadata for each paper", () => {
    for (const paper of samplePapers) {
      expect(paper.source.url.startsWith("http")).toBe(true);
      expect(paper.source.title.length).toBeGreaterThan(0);
    }
  });
});
