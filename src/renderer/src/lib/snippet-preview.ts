export function getSnippetPreviewText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
