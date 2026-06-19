import { describe, expect, it } from "bun:test";

import { clampWindowHeight } from "../../src/main/windows/window-sizing";

describe("clampWindowHeight", () => {
  const bounds = { min: 120, max: 520 };

  it("returns the minimum when the request is below it", () => {
    expect(clampWindowHeight(80, bounds)).toBe(120);
    expect(clampWindowHeight(0, bounds)).toBe(120);
    expect(clampWindowHeight(-50, bounds)).toBe(120);
  });

  it("returns the maximum when the request is above it", () => {
    expect(clampWindowHeight(600, bounds)).toBe(520);
    expect(clampWindowHeight(10_000, bounds)).toBe(520);
  });

  it("returns the request when it is within range", () => {
    expect(clampWindowHeight(300, bounds)).toBe(300);
    expect(clampWindowHeight(120, bounds)).toBe(120);
    expect(clampWindowHeight(520, bounds)).toBe(520);
  });

  it("falls back to the maximum for non-finite requests", () => {
    expect(clampWindowHeight(Number.NaN, bounds)).toBe(520);
    expect(clampWindowHeight(Number.POSITIVE_INFINITY, bounds)).toBe(520);
    expect(clampWindowHeight(Number.NEGATIVE_INFINITY, bounds)).toBe(520);
  });
});
