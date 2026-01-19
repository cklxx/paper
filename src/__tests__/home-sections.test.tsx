import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import Home from "../pages/Home";
import { renderWithRouter } from "../test-utils";

it("renders timeline and feature grid", () => {
  renderWithRouter(<Home />);
  expect(screen.getByText("研究阶段")).toBeInTheDocument();
  expect(screen.getByText("实现阶段")).toBeInTheDocument();
  expect(screen.getByText("实现注意力")).toBeInTheDocument();
});
