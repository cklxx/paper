import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import PaperProblem from "../pages/PaperProblem";
import { renderWithRouter } from "../test-utils";

it("renders the problem title", () => {
  renderWithRouter(<PaperProblem />, {
    route: "/papers/attention_is_all_you_need/problems/a1_positional_encoding",
    path: "/papers/:paperId/problems/:problemId",
  });
  expect(screen.getByText("位置编码")).toBeInTheDocument();
});
