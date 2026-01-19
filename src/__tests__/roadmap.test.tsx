import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import Roadmap from "../pages/Roadmap";
import { renderWithRouter } from "../test-utils";

it("shows roadmap sections", () => {
  renderWithRouter(<Roadmap />);
  expect(screen.getByText("基础 0-10")).toBeInTheDocument();
});
