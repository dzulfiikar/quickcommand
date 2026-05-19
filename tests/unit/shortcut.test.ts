import { describe, expect, test } from "bun:test";
import { formatShortcut, validateShortcut } from "../../src/renderer/src/lib/shortcut";

describe("formatShortcut", () => {
  test("renders mac-native glyphs for Electron accelerator", () => {
    expect(formatShortcut("CommandOrControl+Alt+Space")).toBe("⌘⌥Space");
  });

  test("formats single-letter keys as uppercase", () => {
    expect(formatShortcut("Cmd+Shift+K")).toBe("⌘⇧K");
  });

  test("returns Not set when value is empty", () => {
    expect(formatShortcut(null)).toBe("Not set");
    expect(formatShortcut("")).toBe("Not set");
    expect(formatShortcut("   ")).toBe("Not set");
  });

  test("preserves unknown tokens rather than dropping them", () => {
    expect(formatShortcut("Cmd+F11")).toBe("⌘F11");
  });
});

describe("validateShortcut", () => {
  test("accepts a well-formed accelerator", () => {
    expect(validateShortcut("CommandOrControl+Alt+Space")).toEqual({ ok: true });
    expect(validateShortcut("Cmd+Shift+K")).toEqual({ ok: true });
  });

  test("treats empty input as valid (cleared shortcut)", () => {
    expect(validateShortcut("")).toEqual({ ok: true });
    expect(validateShortcut("   ")).toEqual({ ok: true });
  });

  test("rejects shape without modifier+key separation", () => {
    const result = validateShortcut("asdf");
    expect(result.ok).toBe(false);
  });

  test("rejects unknown modifier names", () => {
    const result = validateShortcut("Foo+Space");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("Foo");
    }
  });

  test("rejects accelerator without any modifier", () => {
    const result = validateShortcut("K");
    expect(result.ok).toBe(false);
  });
});
