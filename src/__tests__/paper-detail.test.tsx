import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import PaperDetail from "../pages/PaperDetail";
import { renderWithRouter } from "../test-utils";

it("renders attention tasks", () => {
  renderWithRouter(<PaperDetail />, {
    route: "/papers/attention_is_all_you_need",
    path: "/papers/:paperId",
  });
  expect(screen.getByText("位置编码")).toBeInTheDocument();
});
