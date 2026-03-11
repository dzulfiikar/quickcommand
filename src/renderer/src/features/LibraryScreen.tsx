import { SearchBar } from "../components/SearchBar";
import { SettingsPanel } from "../components/SettingsPanel";
import { SnippetForm } from "../components/SnippetForm";
import { SnippetList } from "../components/SnippetList";
import type { ScreenProps } from "./screen-props";

export function LibraryScreen(props: ScreenProps) {
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
            onInsert={props.onInsert}
            onEdit={props.editSnippet}
            onRemove={props.onRemove}
          />
        </div>
      </div>

      <div className="stack">
        <div className="panel stack">
          <h2>{props.editingId ? "Edit snippet" : "New snippet"}</h2>
          <SnippetForm
            draft={props.draft}
            onChange={props.onDraftChange}
            onSubmit={props.onSubmitSnippet}
            saving={props.saving}
          />
        </div>
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
      </div>
    </section>
  );
}
