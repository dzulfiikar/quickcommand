import { memo, useEffect, useState } from "react";
import type { SnippetRecord } from "../../../shared/snippet-model";

export const SnippetList = memo(function SnippetList(props: {
  onEdit(snippet: SnippetRecord): void;
  onInsert(id: string): void;
  onRemove(id: string): Promise<void>;
  pageSize?: number;
  snippets: SnippetRecord[];
}) {
  const [page, setPage] = useState(0);
  const pageSize = props.pageSize ?? 0;
  const isPaginated = pageSize > 0;
  const totalPages = isPaginated
    ? Math.max(1, Math.ceil(props.snippets.length / pageSize))
    : 1;

  // Reset to first page when snippet list changes
  useEffect(() => {
    setPage(0);
  }, [props.snippets.length]);

  const visibleSnippets = isPaginated
    ? props.snippets.slice(page * pageSize, (page + 1) * pageSize)
    : props.snippets;

  if (props.snippets.length === 0) {
    return (
      <div className="empty-state">
        <strong>No snippets yet</strong>
        Create your first command to get started.
      </div>
    );
  }

  return (
    <>
      <ul className="snippet-list">
        {visibleSnippets.map((snippet) => (
          <li key={snippet.id} className="snippet-card">
            <div className="snippet-card__header">
              <div className="snippet-card__info">
                <h3>{snippet.title}</h3>
                <p>{snippet.value}</p>
              </div>
              <div className="snippet-card__actions">
                {snippet.useCount > 0 && (
                  <span className="snippet-card__meta">
                    {snippet.useCount}×
                  </span>
                )}
                <button
                  className="paste-button"
                  type="button"
                  onClick={() => void props.onInsert(snippet.id)}
                >
                  Paste ↵
                </button>
              </div>
            </div>
            <div className="snippet-card__secondary">
              <button
                className="secondary-button"
                type="button"
                onClick={() => props.onEdit(snippet)}
              >
                Edit
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() => void props.onRemove(snippet.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {isPaginated && totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination__btn"
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ‹ Prev
          </button>
          <span className="pagination__info">
            {page + 1} / {totalPages}
          </span>
          <button
            className="pagination__btn"
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next ›
          </button>
        </div>
      )}
    </>
  );
});
