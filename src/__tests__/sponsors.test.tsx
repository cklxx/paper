import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import Sponsors from "../pages/Sponsors";
import { renderWithRouter } from "../test-utils";

it("renders sponsor tiers", () => {
  renderWithRouter(<Sponsors />);
  expect(screen.getByText("支持者")).toBeInTheDocument();
});
