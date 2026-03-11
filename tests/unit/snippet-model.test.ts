import { describe, expect, test } from "bun:test";

import {
  exportBundleSchema,
  snippetInputSchema,
  snippetRecordSchema,
} from "../../src/shared/snippet-model";

describe("snippet model", () => {
  test("accepts a valid snippet input", () => {
    const parsed = snippetInputSchema.parse({
      title: "Git Status",
      value: "git status",
    });

    expect(parsed.title).toBe("Git Status");
    expect(parsed.value).toBe("git status");
  });

  test("rejects empty snippet titles", () => {
    expect(() =>
      snippetInputSchema.parse({
        title: " ",
        value: "echo hello",
      }),
    ).toThrow();
  });

  test("accepts an export bundle with versioned metadata", () => {
    const parsed = exportBundleSchema.parse({
      version: 1,
      exportedAt: "2026-03-11T07:00:00.000Z",
      snippets: [
        snippetRecordSchema.parse({
          id: "snippet-1",
          title: "List Files",
          value: "ls -la",
          createdAt: "2026-03-11T07:00:00.000Z",
          updatedAt: "2026-03-11T07:00:00.000Z",
          useCount: 0,
        }),
      ],
    });

    expect(parsed.snippets).toHaveLength(1);
    expect(parsed.version).toBe(1);
  });
});
