import { memo } from "react";
import type { SnippetRecord } from "../../../shared/snippet-model";

export const SnippetList = memo(function SnippetList(props: {
  onEdit(snippet: SnippetRecord): void;
  onInsert(id: string): Promise<void>;
  onRemove(id: string): Promise<void>;
  snippets: SnippetRecord[];
}) {
  if (props.snippets.length === 0) {
    return (
      <div className="empty-state">
        <strong>No snippets yet</strong>
        Create your first command to get started.
      </div>
    );
  }

  return (
    <ul className="snippet-list">
      {props.snippets.map((snippet) => (
        <li key={snippet.id} className="snippet-card">
          <div className="snippet-card__header">
            <div className="snippet-card__info">
              <h3>{snippet.title}</h3>
              <p>{snippet.value}</p>
            </div>
            <div className="snippet-card__actions">
              {snippet.useCount > 0 && (
                <span className="snippet-card__meta">{snippet.useCount}×</span>
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
  );
});
