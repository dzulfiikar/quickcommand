import { describe, expect, it } from "bun:test";

import {
  SHOW_BLUR_GRACE_MS,
  shouldHideOnBlur,
} from "../../src/main/windows/transient-window";

describe("shouldHideOnBlur", () => {
  it("ignores a blur that arrives within the grace period after showing", () => {
    const shownAt = 1_000;
    expect(shouldHideOnBlur(shownAt, shownAt)).toBe(false);
    expect(shouldHideOnBlur(shownAt, shownAt + SHOW_BLUR_GRACE_MS - 1)).toBe(
      false,
    );
  });

  it("hides once the grace period has elapsed", () => {
    const shownAt = 1_000;
    expect(shouldHideOnBlur(shownAt, shownAt + SHOW_BLUR_GRACE_MS)).toBe(true);
    expect(shouldHideOnBlur(shownAt, shownAt + SHOW_BLUR_GRACE_MS + 5_000)).toBe(
      true,
    );
  });

  it("hides for a blur long after a stale show timestamp", () => {
    // A genuine focus loss (user clicks another app) well after show.
    expect(shouldHideOnBlur(0, 60_000)).toBe(true);
  });
});
