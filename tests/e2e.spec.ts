import { expect, test } from "@playwright/test";

test("renders first paper and navigates cards and papers", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByLabel("paper title")).toContainText("Transformer Circuits");
  await expect(page.getByLabel("Hook card")).toContainText("思维线路");

  await page.getByTestId("next-card").click();
  await expect(page.getByLabel("Intuition card")).toContainText("反直觉点");

  await page.getByTestId("next-paper").click();
  await expect(page.getByLabel("paper title")).toContainText("FlashAttention");
  await expect(page.getByLabel("Hook card")).toContainText("显存来回搬");
});
