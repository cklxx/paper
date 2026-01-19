import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import NotFound from "../pages/NotFound";
import { renderWithRouter } from "../test-utils";

it("renders not found message", () => {
  renderWithRouter(<NotFound />);
  expect(screen.getByText("页面不存在")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "回到首页" })).toBeInTheDocument();
});
