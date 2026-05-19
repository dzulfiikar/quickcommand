import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("LibraryScreen accessibility", () => {
  test("uses dialog semantics for the settings overlay", async () => {
    const source = await readFile(
      new URL(
        "../../src/renderer/src/features/LibraryScreen.tsx",
        import.meta.url,
      ),
      "utf8",
    );

    expect(source).toContain('role="dialog"');
    expect(source).toContain('aria-modal="true"');
    expect(source).toContain("aria-labelledby=");
  });
});
