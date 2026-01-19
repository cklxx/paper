import { expect, it } from "vitest";
import { loadJson, saveJson } from "../utils/storage";

it("loadJson returns default on bad JSON", () => {
  localStorage.setItem("pc.bad", "{");
  expect(loadJson("pc.bad", "fallback")).toBe("fallback");
});

it("saveJson writes JSON", () => {
  saveJson("pc.ok", { ok: true });
  expect(localStorage.getItem("pc.ok")).toBe("{\"ok\":true}");
});
