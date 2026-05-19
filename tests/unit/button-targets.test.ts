import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("button target sizes", () => {
  test("keeps compact interactive sizes at or above the 44px target minimum", async () => {
    const source = await readFile(
      new URL(
        "../../src/renderer/src/components/ui/button.tsx",
        import.meta.url,
      ),
      "utf8",
    );

    expect(source).toContain('sm: "h-11');
    expect(source).toContain('"icon-sm": "size-11');
  });
});
