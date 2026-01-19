import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import App from "../App";
import { renderWithRouter } from "../test-utils";

it("routes render Chinese headings", () => {
  renderWithRouter(<App />, { route: "/papers", path: "/*" });
  expect(screen.getByRole("heading", { name: "论文" })).toBeInTheDocument();
});
