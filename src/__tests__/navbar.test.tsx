import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import Navbar from "../components/Navbar";
import { renderWithRouter } from "../test-utils";

it("shows brand and toggles mobile menu", async () => {
  renderWithRouter(<Navbar />);
  expect(screen.getByText("论文代码")).toBeInTheDocument();
  const toggle = screen.getByRole("button", { name: "切换菜单" });
  await userEvent.click(toggle);
  expect(screen.getAllByText("论文").length).toBeGreaterThan(0);
});
