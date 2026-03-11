import { useState } from "react";
import {
  extractParams,
  hasParams,
  substituteParams,
} from "../../../shared/cursor-placeholder";
import { ParamInputForm } from "../components/ParamInputForm";
import { SearchBar } from "../components/SearchBar";
import { SnippetList } from "../components/SnippetList";
import type { ScreenProps } from "./screen-props";
import type { SnippetRecord } from "../../../shared/snippet-model";

export function TrayScreen(props: ScreenProps) {
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

  if (paramSnippet) {
    return (
      <section className="stack">
        <div className="panel stack">
          <ParamInputForm
            params={extractParams(paramSnippet.value)}
            snippetTitle={paramSnippet.title}
            onSubmit={handleParamSubmit}
            onCancel={() => setParamSnippet(null)}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="stack">
      <div className="panel stack">
        <SearchBar
          onQueryChange={props.onQueryChange}
          placeholder="Search snippets…"
        />
        <SnippetList
          snippets={props.filtered.slice(0, 8)}
          onInsert={handleInsert}
          onEdit={props.editSnippet}
          onRemove={props.onRemove}
        />
      </div>
      <div className="panel">
        <div className="tray-menu">
          <button
            className="tray-menu__item"
            type="button"
            onClick={() => {
              props.onNewSnippet();
              void props.onShowLibrary();
            }}
          >
            New Snippet
          </button>
          <button
            className="tray-menu__item"
            type="button"
            onClick={() => void props.onShowLibrary()}
          >
            Open Library
          </button>
          <div className="tray-menu__divider" />
          <button
            className="tray-menu__item tray-menu__item--danger"
            type="button"
            onClick={() => void props.onQuit()}
          >
            Quit QuickCommand
          </button>
        </div>
      </div>
    </section>
  );
}
