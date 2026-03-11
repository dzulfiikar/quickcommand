import { useState } from "react";
import {
  extractParams,
  hasParams,
  substituteParams,
} from "../../../shared/cursor-placeholder";
import type { SnippetRecord } from "../../../shared/snippet-model";
import { ParamInputForm } from "../components/ParamInputForm";
import { SearchBar } from "../components/SearchBar";
import { AboutPanel } from "../components/AboutPanel";
import { SettingsPanel } from "../components/SettingsPanel";
import { SnippetForm } from "../components/SnippetForm";
import { SnippetList } from "../components/SnippetList";
import type { ScreenProps } from "./screen-props";

export function LibraryScreen(props: ScreenProps) {
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

  return (
    <section className="grid-layout">
      <div className="stack">
        <div className="panel stack">
          <div className="toolbar">
            <SearchBar
              onQueryChange={props.onQueryChange}
              placeholder="Search snippets…"
            />
          </div>
          <div className="toolbar">
            <button
              className="action-button"
              type="button"
              onClick={() => void props.onImport()}
            >
              Import
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => void props.onExport()}
            >
              Export
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => void props.onAccessibilityOpen()}
            >
              Accessibility
            </button>
          </div>
          <div className="section-header">
            <span className="section-header__title">Snippets</span>
            <span className="section-header__count">{props.filtered.length}</span>
          </div>
          <SnippetList
            snippets={props.filtered}
            onInsert={handleInsert}
            onEdit={props.editSnippet}
            onRemove={props.onRemove}
            pageSize={10}
          />
        </div>
      </div>

      <div className="stack">
        {paramSnippet ? (
          <div className="panel stack">
            <ParamInputForm
              params={extractParams(paramSnippet.value)}
              snippetTitle={paramSnippet.title}
              onSubmit={handleParamSubmit}
              onCancel={() => setParamSnippet(null)}
            />
          </div>
        ) : (
          <div className="panel stack">
            <h2>{props.editingId ? "Edit snippet" : "New snippet"}</h2>
            <SnippetForm
              draft={props.draft}
              onChange={props.onDraftChange}
              onSubmit={props.onSubmitSnippet}
              saving={props.saving}
            />
          </div>
        )}
        {props.settings ? (
          <div className="panel stack">
            <h2>Settings</h2>
            <SettingsPanel
              settings={props.settings}
              onSaveSettings={props.onSaveSettings}
              showClipboardDelay
            />
          </div>
        ) : null}
        <div className="panel stack">
          <h2>About</h2>
          <AboutPanel />
        </div>
      </div>
    </section>
  );
}
