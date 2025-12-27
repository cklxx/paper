import { describe, expect, it } from "vitest";
import type { Paper } from "./papers";
import { rankPapersForUser, type UserFeedback } from "./recommendations";

const makePaper = (id: string): Paper => ({
  id,
  title: id,
  topic: "Test",
  source: { title: "Example", url: "https://example.com" },
  cards: [],
});

describe("rankPapersForUser", () => {
  it("promotes papers that share neighbors with the active user", () => {
    const papers = [
      makePaper("alpha"),
      makePaper("beta"),
      makePaper("gamma-v2"),
    ];
    const feedback: UserFeedback[] = [
      { userId: "active", ratings: { alpha: 5 } },
      { userId: "neighbor", ratings: { alpha: 4, gamma: 5 } },
      { userId: "critic", ratings: { beta: 2, gamma: 3 } },
    ];

    const ranked = rankPapersForUser(papers, feedback, "active");

    expect(ranked.map((paper) => paper.id)).toEqual([
      "alpha",
      "gamma-v2",
      "beta",
    ]);
  });

  it("keeps scores stable when no similar history exists", () => {
    const papers = [makePaper("delta"), makePaper("epsilon")];
    const feedback: UserFeedback[] = [
      { userId: "active", ratings: { delta: 3.5 } },
      { userId: "peer", ratings: { beta: 2.0 } },
    ];

    const ranked = rankPapersForUser(papers, feedback, "active");

    expect(ranked).toHaveLength(2);
    expect(ranked[0].id).toBe("delta");
    expect(ranked[1].id).toBe("epsilon");
  });
});
