import { describe, expect, it } from "vitest";
import { samplePapers } from "./papers";

describe("samplePapers", () => {
  it("contains five cards per paper", () => {
    for (const paper of samplePapers) {
      expect(paper.cards).toHaveLength(5);
    }
  });

  it("keeps topics labeled", () => {
    const topics = new Set(samplePapers.map((paper) => paper.topic));
    expect(topics.size).toBeGreaterThan(1);
  });
});
