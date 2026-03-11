import { useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { SnippetForm } from "../components/SnippetForm";
import { SnippetList } from "../components/SnippetList";
import type { ScreenProps } from "./screen-props";

export function PaletteScreen(props: ScreenProps) {
  const [showForm, setShowForm] = useState(false);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" && event.metaKey && props.filtered.length > 0) {
      event.preventDefault();
      void props.onInsert(props.filtered[0].id);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    await props.onSubmitSnippet(event);
    setShowForm(false);
    props.onNewSnippet();
  }

  return (
    <section className="panel stack" onKeyDown={handleKeyDown}>
      {showForm ? (
        <>
          <div className="toolbar">
            <span className="form-heading">New Command</span>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setShowForm(false);
                props.onNewSnippet();
              }}
            >
              Cancel
            </button>
          </div>
          <SnippetForm
            draft={props.draft}
            onChange={props.onDraftChange}
            onSubmit={handleSubmit}
            saving={props.saving}
          />
        </>
      ) : (
        <>
          <div className="toolbar">
            <SearchBar
              onQueryChange={props.onQueryChange}
              placeholder="Search snippets…"
            />
            <button
              className="action-button"
              type="button"
              onClick={() => {
                props.onNewSnippet();
                setShowForm(true);
              }}
            >
              + New
            </button>
          </div>
          <SnippetList
            snippets={props.filtered}
            onInsert={props.onInsert}
            onEdit={props.editSnippet}
            onRemove={props.onRemove}
          />
          {props.filtered.length > 0 && (
            <p className="hint">
              <kbd className="kbd">⌘↵</kbd> paste top result · <kbd className="kbd">Esc</kbd> dismiss
            </p>
          )}
        </>
      )}
    </section>
  );
}
