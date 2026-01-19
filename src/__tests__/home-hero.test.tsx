import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import Home from "../pages/Home";
import { renderWithRouter } from "../test-utils";

it("renders home hero", () => {
  renderWithRouter(<Home />);
  expect(screen.getByRole("heading", { name: /别只读论文/ })).toBeInTheDocument();
  expect(screen.getByText("开始动手")).toBeInTheDocument();
});
