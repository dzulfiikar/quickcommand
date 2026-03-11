/**
 * Marker that indicates where the cursor should be positioned after pasting.
 * Only the first occurrence is processed; any extras are pasted literally.
 */
export const CURSOR_PLACEHOLDER = "{cursor}";

/**
 * Pattern for named template parameters: {paramName}
 * Matches alphabetic identifiers with underscores, avoids ${shell} variables.
 */
const PARAM_PATTERN = /(?<!\$)\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;

/**
 * Extract unique parameter names from a template string, in order of first appearance.
 */
export function extractParams(text: string): string[] {
  const seen = new Set<string>();
  const params: string[] = [];

  for (const match of text.matchAll(PARAM_PATTERN)) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      params.push(name);
    }
  }

  return params;
}

/**
 * Check if a text contains any template parameters.
 */
export function hasParams(text: string): boolean {
  return PARAM_PATTERN.test(text);
}

/**
 * Replace all `{paramName}` occurrences with the corresponding values.
 * Parameters not present in `values` are left as-is.
 */
export function substituteParams(
  text: string,
  values: Record<string, string>,
): string {
  return text.replace(PARAM_PATTERN, (match, name: string) => {
    return name in values ? values[name] : match;
  });
}

/**
 * Strip the first `{cursor}` marker and return clean text + offset.
 * @deprecated Use extractParams + substituteParams instead.
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
