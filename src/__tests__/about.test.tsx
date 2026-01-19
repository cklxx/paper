import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import About from "../pages/About";
import { renderWithRouter } from "../test-utils";

it("renders about sections", () => {
  renderWithRouter(<About />);
  expect(screen.getByText("我们在做什么")).toBeInTheDocument();
});
