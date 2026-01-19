import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import Papers from "../pages/Papers";
import { renderWithRouter } from "../test-utils";

it("filters papers by search", async () => {
  renderWithRouter(<Papers />);
  const input = screen.getByPlaceholderText("搜索论文、标签...");
  await userEvent.type(input, "注意力");
  expect(screen.getByText("注意力机制")).toBeInTheDocument();
});
