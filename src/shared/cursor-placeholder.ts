/**
 * Marker that indicates where the cursor should be positioned after pasting.
 * Only the first occurrence is processed; any extras are pasted literally.
 */
export const CURSOR_PLACEHOLDER = "{cursor}";

/**
 * Strip the first `{cursor}` marker and return clean text + offset.
 * Offset = number of characters after the marker (how far left to move).
 */
export function parseCursorPlaceholder(text: string): {
  cleanText: string;
  cursorOffset: number;
} {
  const idx = text.indexOf(CURSOR_PLACEHOLDER);
  if (idx === -1) {
    return { cleanText: text, cursorOffset: 0 };
  }

  const before = text.slice(0, idx);
  const after = text.slice(idx + CURSOR_PLACEHOLDER.length);
  return { cleanText: before + after, cursorOffset: after.length };
}
