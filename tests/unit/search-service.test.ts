import { describe, expect, test } from "bun:test";

import { SnippetSearchService } from "../../src/main/services/search-service";
import type { SnippetRecord } from "../../src/shared/snippet-model";

const snippets: SnippetRecord[] = [
  {
    id: "snippet-1",
    title: "Git status",
    value: "git status",
    createdAt: "2026-03-11T07:00:00.000Z",
    updatedAt: "2026-03-11T07:00:00.000Z",
    useCount: 1,
  },
  {
    id: "snippet-2",
    title: "Docker compose logs",
    value: "docker compose logs -f",
    createdAt: "2026-03-11T07:00:00.000Z",
    updatedAt: "2026-03-11T07:00:00.000Z",
    lastUsedAt: "2026-03-11T08:00:00.000Z",
    useCount: 6,
  },
];

describe("SnippetSearchService", () => {
  test("returns fuzzy matches ranked by title relevance and usage", () => {
    const service = new SnippetSearchService();
    const results = service.search(snippets, "docker");

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("snippet-2");
  });

  test("returns recent snippets when the query is empty", () => {
    const service = new SnippetSearchService();
    const results = service.search(snippets, "");

    expect(results.map((snippet) => snippet.id)).toEqual([
      "snippet-2",
      "snippet-1",
    ]);
  });
});
