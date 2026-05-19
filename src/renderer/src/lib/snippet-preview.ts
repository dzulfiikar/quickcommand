/** Pattern for named template parameters. Mirrors shared/cursor-placeholder.ts. */
const PARAM_PATTERN = /(?<!\$)\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;

export type SnippetPreviewPart =
  | { kind: "text"; value: string }
  | { kind: "param"; name: string };

/** Single-line preview text for snippet titles and values. */
export function getSnippetPreviewText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Split preview text into literal text and parameter placeholders, so consumers
 * can render `{name}` placeholders as inline chips instead of raw text.
 */
export function getSnippetPreviewParts(text: string): SnippetPreviewPart[] {
  const collapsed = getSnippetPreviewText(text);
  if (!collapsed) {
    return [];
  }

  const parts: SnippetPreviewPart[] = [];
  let lastIndex = 0;

  for (const match of collapsed.matchAll(PARAM_PATTERN)) {
    if (match.index === undefined) continue;
    if (match.index > lastIndex) {
      parts.push({
        kind: "text",
        value: collapsed.slice(lastIndex, match.index),
      });
    }
    parts.push({ kind: "param", name: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < collapsed.length) {
    parts.push({ kind: "text", value: collapsed.slice(lastIndex) });
  }

  return parts;
}
