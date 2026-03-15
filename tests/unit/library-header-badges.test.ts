import { describe, expect, test } from "bun:test";
import {
  getLibraryAccessibilityBadge,
  getLibraryShortcutBadge,
} from "../../src/renderer/src/lib/library-header-badges";

describe("library header badges", () => {
  test("uses an emphasized info highlight for configured shortcuts", () => {
    const badge = getLibraryShortcutBadge("CommandOrControl+Alt+Space");

    expect(badge.label).toBe("CommandOrControl+Alt+Space");
    expect(badge.className).toContain("bg-sky-500/12");
    expect(badge.className).toContain("border-sky-400/30");
  });

  test("uses a warning highlight when no shortcut is configured", () => {
    const badge = getLibraryShortcutBadge(null);

    expect(badge.label).toBe("No hotkey configured");
    expect(badge.className).toContain("bg-amber-500/12");
    expect(badge.className).toContain("border-amber-400/35");
  });

  test("uses a success highlight when accessibility is ready", () => {
    const badge = getLibraryAccessibilityBadge(true);

    expect(badge.label).toBe("Accessibility ready");
    expect(badge.className).toContain("bg-emerald-500/12");
    expect(badge.className).toContain("border-emerald-400/30");
  });

  test("uses a warning highlight when accessibility is still required", () => {
    const badge = getLibraryAccessibilityBadge(false);

    expect(badge.label).toBe("Accessibility required");
    expect(badge.className).toContain("bg-yellow-500/12");
    expect(badge.className).toContain("border-yellow-400/35");
  });
});
