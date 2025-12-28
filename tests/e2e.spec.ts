import { expect, test } from "@playwright/test";
import { samplePapers } from "../src/data/papers";
import {
  ACTIVE_USER_ID,
  collaborativeFeedback,
  rankPapersForUser,
} from "../src/data/recommendations";

const ranked = rankPapersForUser(samplePapers, collaborativeFeedback, ACTIVE_USER_ID);
const firstPaper = ranked[0];
const secondPaper = ranked[1];
const firstHook = firstPaper.cards.find((card) => card.type === "hook");
const firstIntuition = firstPaper.cards.find((card) => card.type === "intuition");
const secondHook = secondPaper.cards.find((card) => card.type === "hook");

test("renders first paper and navigates cards and papers", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByLabel("paper title")).toContainText(firstPaper.title);
  await expect(page.getByLabel("Hook card")).toContainText(firstHook?.text ?? "");

  await page.getByTestId("next-card").click();
  await expect(page.getByLabel("Intuition card")).toContainText(firstIntuition?.text ?? "");

  await page.getByTestId("next-paper").click();
  await expect(page.getByLabel("paper title")).toContainText(secondPaper.title);
  await expect(page.getByLabel("Hook card")).toContainText(secondHook?.text ?? "");
});
