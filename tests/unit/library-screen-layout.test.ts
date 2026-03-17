import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("LibraryScreen layout", () => {
  test("keeps the main detail area scroll container min-height constrained", async () => {
    const source = await readFile(
      new URL("../../src/renderer/src/features/LibraryScreen.tsx", import.meta.url),
      "utf8",
    );

    expect(source).toMatch(
      /<main className="flex flex-1 flex-col min-w-0 overflow-hidden">\s*<ScrollArea className="flex-1 min-h-0">/,
    );
  });
});
