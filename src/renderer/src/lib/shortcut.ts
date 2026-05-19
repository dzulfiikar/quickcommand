/**
 * Electron's `globalShortcut` accelerator strings (e.g. "CommandOrControl+Alt+Space")
 * are technical. We display them with mac-native modifier glyphs and friendly key names.
 */

const ACCELERATOR_PATTERN = /^(?:[A-Za-z]+\+)+[A-Za-z0-9]+$/;
const KNOWN_MODIFIERS: Record<string, string> = {
  command: "⌘",
  cmd: "⌘",
  commandorcontrol: "⌘",
  cmdorctrl: "⌘",
  control: "⌃",
  ctrl: "⌃",
  alt: "⌥",
  option: "⌥",
  shift: "⇧",
  meta: "⌘",
  super: "⌘",
};

const KEY_DISPLAY: Record<string, string> = {
  return: "↩",
  enter: "↩",
  tab: "⇥",
  escape: "⎋",
  esc: "⎋",
  backspace: "⌫",
  delete: "⌦",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
  space: "Space",
  plus: "+",
};

/**
 * Format an accelerator string for display.
 * Returns the input unchanged when shape is unrecognized so existing custom values still surface.
 */
export function formatShortcut(value: string | null | undefined): string {
  if (!value) {
    return "Not set";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "Not set";
  }

  return trimmed
    .split("+")
    .map((part) => {
      const key = part.toLowerCase();
      if (key in KNOWN_MODIFIERS) {
        return KNOWN_MODIFIERS[key];
      }
      if (key in KEY_DISPLAY) {
        return KEY_DISPLAY[key];
      }
      if (part.length === 1) {
        return part.toUpperCase();
      }
      return part;
    })
    .join("");
}

/**
 * Validate that an accelerator string is a plausibly-shaped Electron accelerator:
 * one or more known modifiers followed by a single key.
 */
export function validateShortcut(
  value: string,
): { ok: true } | { ok: false; reason: string } {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: true };
  }

  if (!ACCELERATOR_PATTERN.test(trimmed)) {
    return {
      ok: false,
      reason: "Use modifier+key form, e.g. Cmd+Alt+Space.",
    };
  }

  const parts = trimmed.split("+");
  const key = parts[parts.length - 1];
  const modifiers = parts.slice(0, -1);

  if (modifiers.length === 0) {
    return {
      ok: false,
      reason: "Add at least one modifier (Cmd, Ctrl, Alt, Shift).",
    };
  }

  for (const modifier of modifiers) {
    if (!(modifier.toLowerCase() in KNOWN_MODIFIERS)) {
      return {
        ok: false,
        reason: `Unknown modifier "${modifier}".`,
      };
    }
  }

  if (key.length === 0) {
    return { ok: false, reason: "Add a key after the last modifier." };
  }

  return { ok: true };
}
