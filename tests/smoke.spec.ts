import { test, expect } from "@playwright/test";

test("can navigate to papers and filter", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "论文", exact: true }).click();
  await expect(page.getByRole("heading", { name: "论文" })).toBeVisible();
  await page.getByPlaceholder("搜索论文、标签...").fill("注意力");
  await expect(page.getByText("注意力机制")).toBeVisible();
});
