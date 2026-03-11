import { useState } from "react";
import {
  extractParams,
  hasParams,
  substituteParams,
} from "../../../shared/cursor-placeholder";
import type { SnippetRecord } from "../../../shared/snippet-model";
import { ParamInputForm } from "../components/ParamInputForm";
import { SearchBar } from "../components/SearchBar";
import { SnippetForm } from "../components/SnippetForm";
import { SnippetList } from "../components/SnippetList";
import type { ScreenProps } from "./screen-props";

export function PaletteScreen(props: ScreenProps) {
  const [showForm, setShowForm] = useState(false);
  const [paramSnippet, setParamSnippet] = useState<SnippetRecord | null>(null);

  function handleInsert(id: string) {
    const snippet = props.filtered.find((s) => s.id === id);
    if (snippet && hasParams(snippet.value)) {
      setParamSnippet(snippet);
    } else {
      void props.onInsert(id);
    }
  }

  function handleParamSubmit(values: Record<string, string>) {
    if (!paramSnippet) return;
    const finalText = substituteParams(paramSnippet.value, values);
    setParamSnippet(null);
    void props.onInsertText(paramSnippet.id, finalText);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" && event.metaKey && props.filtered.length > 0) {
      event.preventDefault();
      handleInsert(props.filtered[0].id);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    await props.onSubmitSnippet(event);
    setShowForm(false);
    props.onNewSnippet();
  }

  if (paramSnippet) {
    return (
      <section className="panel stack">
        <ParamInputForm
          params={extractParams(paramSnippet.value)}
          snippetTitle={paramSnippet.title}
          onSubmit={handleParamSubmit}
          onCancel={() => setParamSnippet(null)}
        />
      </section>
    );
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
            onInsert={handleInsert}
            onEdit={props.editSnippet}
            onRemove={props.onRemove}
          />
          {props.filtered.length > 0 && (
            <p className="hint">
              <kbd className="kbd">⌘↵</kbd> paste top result ·{" "}
              <kbd className="kbd">Esc</kbd> dismiss
            </p>
          )}
        </>
      )}
    </section>
  );
}
