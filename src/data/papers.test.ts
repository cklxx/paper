import { describe, expect, it } from "vitest";
import seedPapers from "../../data/paper_seeds.json";
import { samplePapers } from "./papers";

describe("samplePapers", () => {
  it("keeps one paper per seed", () => {
    const expectedLength = (seedPapers as unknown[]).length;
    expect(samplePapers).toHaveLength(expectedLength);
  });

  it("contains six cards per paper and ends with a source card", () => {
    for (const paper of samplePapers) {
      expect(paper.cards).toHaveLength(6);
      const sourceCard = paper.cards.at(-1);
      expect(sourceCard?.type).toBe("source");
      if (sourceCard?.type === "source") {
        expect(sourceCard.url.startsWith("http")).toBe(true);
        expect(sourceCard.title.length).toBeGreaterThan(0);
      }
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
