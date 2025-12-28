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

  const cardFrame = page.getByTestId("card-frame");

  const swipe = async (from: { x: number; y: number }, to: { x: number; y: number }) => {
    await cardFrame.dispatchEvent("pointerdown", { clientX: from.x, clientY: from.y });
    await cardFrame.dispatchEvent("pointerup", { clientX: to.x, clientY: to.y });
  };

  await swipe({ x: 300, y: 300 }, { x: 150, y: 300 });
  await expect(page.getByLabel("Intuition card")).toContainText(firstIntuition?.text ?? "");

  await swipe({ x: 300, y: 400 }, { x: 300, y: 200 });
  await expect(page.getByLabel("paper title")).toContainText(secondPaper.title);
  await expect(page.getByLabel("Hook card")).toContainText(secondHook?.text ?? "");
});
