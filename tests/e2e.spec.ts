import { expect, test, devices } from "@playwright/test";
import { samplePapers } from "../src/data/papers";
import {
  ACTIVE_USER_ID,
  collaborativeFeedback,
  rankPapersForUser,
} from "../src/data/recommendations";

test.use({ ...devices["Pixel 5"] });

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
    const box = await cardFrame.boundingBox();
    if (!box) throw new Error("Unable to measure card frame");

    const toAbsolute = (point: { x: number; y: number }) => ({
      x: box.x + point.x,
      y: box.y + point.y,
    });

    const start = toAbsolute(from);
    const end = toAbsolute(to);
    const mid = toAbsolute({ x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 });

    await cardFrame.dispatchEvent("pointerdown", {
      pointerType: "touch",
      clientX: start.x,
      clientY: start.y,
    });
    await cardFrame.dispatchEvent("pointermove", {
      pointerType: "touch",
      clientX: mid.x,
      clientY: mid.y,
    });
    await cardFrame.dispatchEvent("pointerup", {
      pointerType: "touch",
      clientX: end.x,
      clientY: end.y,
    });
  };

  await swipe({ x: 200, y: 200 }, { x: 60, y: 200 });
  await expect(page.getByLabel("Intuition card")).toContainText(firstIntuition?.text ?? "");

  await swipe({ x: 200, y: 360 }, { x: 200, y: 120 });
  await expect(page.getByLabel("paper title")).toContainText(secondPaper.title);
  await expect(page.getByLabel("Hook card")).toContainText(secondHook?.text ?? "");
});
