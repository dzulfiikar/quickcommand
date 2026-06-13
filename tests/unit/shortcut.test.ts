import { describe, expect, test } from "bun:test";
import {
  formatShortcut,
  keyEventToAccelerator,
} from "../../src/renderer/src/lib/shortcut";

/** Build a minimal keyboard-event shape for keyEventToAccelerator. */
function keyEvent(
  overrides: Partial<{
    key: string;
    code: string;
    metaKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
  }>,
) {
  return {
    key: "",
    code: "",
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    ...overrides,
  };
}

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

describe("keyEventToAccelerator", () => {
  test("captures a letter with modifiers as an Electron accelerator", () => {
    const result = keyEventToAccelerator(
      keyEvent({ key: "k", code: "KeyK", metaKey: true, shiftKey: true }),
    );
    expect(result).toBe("Command+Shift+K");
  });

  test("orders modifiers Command, Control, Alt, Shift", () => {
    const result = keyEventToAccelerator(
      keyEvent({
        key: "j",
        code: "KeyJ",
        metaKey: true,
        ctrlKey: true,
        altKey: true,
        shiftKey: true,
      }),
    );
    expect(result).toBe("Command+Control+Alt+Shift+J");
  });

  test("maps Space code to the Space key name", () => {
    const result = keyEventToAccelerator(
      keyEvent({ key: " ", code: "Space", metaKey: true, altKey: true }),
    );
    expect(result).toBe("Command+Alt+Space");
  });

  test("captures function keys without requiring a modifier", () => {
    expect(keyEventToAccelerator(keyEvent({ key: "F5", code: "F5" }))).toBe(
      "F5",
    );
  });

  test("captures digits from their physical code", () => {
    const result = keyEventToAccelerator(
      keyEvent({ key: "@", code: "Digit2", ctrlKey: true, shiftKey: true }),
    );
    expect(result).toBe("Control+Shift+2");
  });

  test("maps arrow and named keys to Electron key names", () => {
    expect(
      keyEventToAccelerator(
        keyEvent({ key: "ArrowUp", code: "ArrowUp", metaKey: true }),
      ),
    ).toBe("Command+Up");
    expect(
      keyEventToAccelerator(
        keyEvent({ key: "Enter", code: "Enter", metaKey: true }),
      ),
    ).toBe("Command+Return");
  });

  test("returns null while only modifiers are held", () => {
    expect(
      keyEventToAccelerator(
        keyEvent({ key: "Meta", code: "MetaLeft", metaKey: true }),
      ),
    ).toBeNull();
    expect(
      keyEventToAccelerator(
        keyEvent({ key: "Shift", code: "ShiftLeft", shiftKey: true }),
      ),
    ).toBeNull();
  });

  test("requires a modifier for a bare letter so it can't shadow typing", () => {
    expect(
      keyEventToAccelerator(keyEvent({ key: "k", code: "KeyK" })),
    ).toBeNull();
  });

  test("requires a modifier for bare Space, punctuation, and editing keys", () => {
    // Registering these globally with no modifier would hijack them everywhere.
    expect(
      keyEventToAccelerator(keyEvent({ key: " ", code: "Space" })),
    ).toBeNull();
    expect(
      keyEventToAccelerator(keyEvent({ key: ".", code: "Period" })),
    ).toBeNull();
    expect(
      keyEventToAccelerator(keyEvent({ key: "Enter", code: "Enter" })),
    ).toBeNull();
    expect(
      keyEventToAccelerator(keyEvent({ key: "ArrowUp", code: "ArrowUp" })),
    ).toBeNull();
  });
});
