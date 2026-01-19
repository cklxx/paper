import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import Reviews from "../pages/Reviews";
import { renderWithRouter } from "../test-utils";

it("renders review list", () => {
  renderWithRouter(<Reviews />);
  expect(screen.getByText("实现难度")).toBeInTheDocument();
});
