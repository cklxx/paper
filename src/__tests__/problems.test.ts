import { expect, it } from "vitest";
import { getProblemById, getProblemsForPaperId } from "../data/problems";

it("returns attention tasks", () => {
  const problems = getProblemsForPaperId("attention_is_all_you_need");
  expect(problems.some((problem) => problem.id === "a1_positional_encoding")).toBe(true);
});

it("finds problem by id", () => {
  const problem = getProblemById("attention_is_all_you_need", "a1_positional_encoding");
  expect(problem?.spec.entry).toBe("positional_encoding");
});
