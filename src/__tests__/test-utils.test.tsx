import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { renderWithRouter } from "../test-utils";

it("renderWithRouter renders children", () => {
  renderWithRouter(<div>OK</div>, { route: "/demo" });
  expect(screen.getByText("OK")).toBeInTheDocument();
});
