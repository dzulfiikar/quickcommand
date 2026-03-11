import Fuse from "fuse.js";

import type { SnippetRecord } from "../../shared/snippet-model";

export class SnippetSearchService {
  search(snippets: SnippetRecord[], query: string): SnippetRecord[] {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length === 0) {
      return [...snippets].sort(compareByRecencyAndUsage);
    }

    const fuse = new Fuse(snippets, {
      includeScore: true,
      threshold: 0.35,
      ignoreLocation: true,
      keys: [
        { name: "title", weight: 0.7 },
        { name: "value", weight: 0.3 },
      ],
    });

    return fuse
      .search(normalizedQuery)
      .sort((left, right) => {
        const scoreDelta = (left.score ?? 1) - (right.score ?? 1);
        if (scoreDelta !== 0) {
          return scoreDelta;
        }

        return compareByRecencyAndUsage(left.item, right.item);
      })
      .map((result) => result.item);
  }
}

function compareByRecencyAndUsage(
  left: SnippetRecord,
  right: SnippetRecord,
): number {
  const rightLastUsed = Date.parse(right.lastUsedAt ?? right.updatedAt);
  const leftLastUsed = Date.parse(left.lastUsedAt ?? left.updatedAt);

  if (rightLastUsed !== leftLastUsed) {
    return rightLastUsed - leftLastUsed;
  }

  if (right.useCount !== left.useCount) {
    return right.useCount - left.useCount;
  }

  return right.updatedAt.localeCompare(left.updatedAt);
}
