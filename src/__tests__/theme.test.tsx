import { expect, it } from "vitest";
import { renderWithRouter } from "../test-utils";
import Layout from "../components/Layout";

it("sets dark theme classes", () => {
  renderWithRouter(<Layout />);
  expect(document.documentElement.classList.contains("dark")).toBe(true);
});
