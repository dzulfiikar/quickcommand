import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("renderer theme", () => {
  test("uses flat tonal layering and respects reduced motion", async () => {
    const source = await readFile(
      new URL("../../src/renderer/src/styles.css", import.meta.url),
      "utf8",
    );

    expect(source).toContain(".surface");
    expect(source).toContain("--surface-1");
    expect(source).toContain("--surface-2");
    expect(source).toContain("--surface-3");
    expect(source).toContain("prefers-reduced-motion");
    expect(source).not.toContain("backdrop-filter");
    expect(source).not.toContain("-webkit-backdrop-filter");
    expect(source).not.toMatch(/\.surface\s*\{[^}]*box-shadow/);
  });
});
