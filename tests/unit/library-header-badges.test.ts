import { describe, expect, test } from "bun:test";
import {
  getLibraryAccessibilityBadge,
  getLibraryShortcutBadge,
} from "../../src/renderer/src/lib/library-header-badges";

describe("library header badges", () => {
  test("uses a neutral highlight for configured shortcuts", () => {
    const badge = getLibraryShortcutBadge("CommandOrControl+Alt+Space");

    expect(badge.label).toBe("CommandOrControl+Alt+Space");
    expect(badge.className).toContain("status-pill");
  });

  test("uses a warning highlight when no shortcut is configured", () => {
    const badge = getLibraryShortcutBadge(null);

    expect(badge.label).toBe("No hotkey configured");
    expect(badge.className).toContain("status-pill--warning");
  });

  test("uses a success highlight when accessibility is ready", () => {
    const badge = getLibraryAccessibilityBadge(true);

    expect(badge.label).toBe("Accessibility ready");
    expect(badge.className).toContain("status-pill--success");
  });

  test("uses a warning highlight when accessibility is still required", () => {
    const badge = getLibraryAccessibilityBadge(false);

    expect(badge.label).toBe("Accessibility required");
    expect(badge.className).toContain("status-pill--warning");
  });
});
