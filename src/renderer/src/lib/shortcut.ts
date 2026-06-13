/**
 * Electron's `globalShortcut` accelerator strings (e.g. "CommandOrControl+Alt+Space")
 * are technical. We display them with mac-native modifier glyphs and friendly key names.
 */

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

/** A captured keyboard event, narrowed to the fields we read. */
type ShortcutKeyEvent = {
  key: string;
  code: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
};

/** `event.code` values that are themselves modifier keys, never a final key. */
const MODIFIER_CODES = new Set([
  "MetaLeft",
  "MetaRight",
  "ControlLeft",
  "ControlRight",
  "AltLeft",
  "AltRight",
  "ShiftLeft",
  "ShiftRight",
]);

/**
 * Map a physical `event.code` to the Electron accelerator key name. Reading the
 * code (not `event.key`) keeps capture layout-stable: Shift+2 records as "2",
 * not "@", and the result is independent of the user's keyboard locale.
 */
const CODE_TO_KEY: Record<string, string> = {
  Space: "Space",
  Enter: "Return",
  NumpadEnter: "Return",
  Tab: "Tab",
  Backspace: "Backspace",
  Delete: "Delete",
  Escape: "Escape",
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
  Minus: "-",
  Equal: "=",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  Semicolon: ";",
  Quote: "'",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Backquote: "`",
};

/**
 * Convert a live keyboard event into an Electron accelerator string, or null
 * when the event is not yet a usable shortcut (only modifiers held, or a bare
 * key that would shadow ordinary typing). Letters/digits without a modifier are
 * rejected; function keys and navigation keys stand alone.
 */
export function keyEventToAccelerator(event: ShortcutKeyEvent): string | null {
  if (MODIFIER_CODES.has(event.code)) {
    return null;
  }

  let resolved: string | null = null;

  if (event.code in CODE_TO_KEY) {
    resolved = CODE_TO_KEY[event.code];
  } else if (/^Key[A-Z]$/.test(event.code)) {
    resolved = event.code.slice(3);
  } else if (/^Digit[0-9]$/.test(event.code)) {
    resolved = event.code.slice(5);
  } else if (/^Numpad[0-9]$/.test(event.code)) {
    resolved = event.code.slice(6);
  } else if (/^F([1-9]|1[0-9]|2[0-4])$/.test(event.code)) {
    resolved = event.code;
  } else if (event.key.length === 1) {
    // Fallback for codes we don't enumerate; uppercase single chars.
    resolved = event.key.toUpperCase();
  }

  if (!resolved) {
    return null;
  }

  const modifiers: string[] = [];
  if (event.metaKey) modifiers.push("Command");
  if (event.ctrlKey) modifiers.push("Control");
  if (event.altKey) modifiers.push("Alt");
  if (event.shiftKey) modifiers.push("Shift");

  // Only function keys may stand alone. A bare letter, digit, Space, arrow, or
  // punctuation registered globally would intercept that key in every app
  // system-wide and shadow ordinary typing, so everything else needs a modifier.
  const standsAlone = /^F([1-9]|1[0-9]|2[0-4])$/.test(event.code);
  if (modifiers.length === 0 && !standsAlone) {
    return null;
  }

  return [...modifiers, resolved].join("+");
}
