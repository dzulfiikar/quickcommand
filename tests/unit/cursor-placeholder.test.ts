import { describe, expect, it } from "bun:test";

import {
  CURSOR_PLACEHOLDER,
  parseCursorPlaceholder,
} from "../../src/shared/cursor-placeholder";

describe("parseCursorPlaceholder", () => {
  it("returns text unchanged when no placeholder exists", () => {
    const result = parseCursorPlaceholder("echo hello");
    expect(result.cleanText).toBe("echo hello");
    expect(result.cursorOffset).toBe(0);
  });

  it("strips the placeholder and computes offset from end", () => {
    const result = parseCursorPlaceholder('git commit -M "{cursor}"');
    expect(result.cleanText).toBe('git commit -M ""');
    expect(result.cursorOffset).toBe(1);
  });

  it("handles placeholder at the end of text", () => {
    const result = parseCursorPlaceholder("echo {cursor}");
    expect(result.cleanText).toBe("echo ");
    expect(result.cursorOffset).toBe(0);
  });

  it("handles placeholder at the start of text", () => {
    const result = parseCursorPlaceholder("{cursor} world");
    expect(result.cleanText).toBe(" world");
    expect(result.cursorOffset).toBe(6);
  });

  it("only strips the first placeholder when multiple exist", () => {
    const result = parseCursorPlaceholder("a {cursor} b {cursor} c");
    expect(result.cleanText).toBe("a  b {cursor} c");
    expect(result.cursorOffset).toBe(" b {cursor} c".length);
  });

  it("handles placeholder surrounded by quotes", () => {
    const result = parseCursorPlaceholder(
      "curl -H 'Authorization: Bearer {cursor}' https://api.example.com",
    );
    expect(result.cleanText).toBe(
      "curl -H 'Authorization: Bearer ' https://api.example.com",
    );
    expect(result.cursorOffset).toBe("' https://api.example.com".length);
  });

  it("exports the cursor placeholder constant", () => {
    expect(CURSOR_PLACEHOLDER).toBe("{cursor}");
  });
});
