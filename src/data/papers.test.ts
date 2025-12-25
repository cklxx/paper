import { describe, expect, it } from "vitest";
import { samplePapers } from "./papers";

describe("samplePapers", () => {
  it("contains 100 demo papers", () => {
    expect(samplePapers).toHaveLength(100);
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
