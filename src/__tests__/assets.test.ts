import fs from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";

it("key assets exist", () => {
  const root = path.resolve(__dirname, "../../public/assets");
  expect(fs.existsSync(path.join(root, "logo.jpeg"))).toBe(true);
  expect(fs.existsSync(path.join(root, "noise.svg"))).toBe(true);
});
