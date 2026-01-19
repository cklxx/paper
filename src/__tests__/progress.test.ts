import { expect, it } from "vitest";
import { getProgressCounts } from "../hooks/useProgress";

it("computes progress counts", () => {
  const progress = {
    paper_a: { task_1: true, task_2: false },
  };
  const counts = getProgressCounts(progress, "paper_a", ["task_1", "task_2", "task_3"]);
  expect(counts).toEqual({ completed: 1, total: 3 });
});
