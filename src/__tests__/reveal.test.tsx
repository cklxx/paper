import { renderHook } from "@testing-library/react";
import { expect, it } from "vitest";
import { useReveal } from "../hooks/useReveal";

it("useReveal returns hidden state initially", () => {
  const { result } = renderHook(() => useReveal());
  expect(result.current.visible).toBe(false);
});
