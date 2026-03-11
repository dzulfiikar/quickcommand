import { SearchBar } from "../components/SearchBar";
import { SnippetList } from "../components/SnippetList";
import type { ScreenProps } from "./screen-props";

export function TrayScreen(props: ScreenProps) {
  return (
    <section className="stack">
      <div className="panel stack">
        <SearchBar
          onQueryChange={props.onQueryChange}
          placeholder="Search snippets…"
        />
        <SnippetList
          snippets={props.filtered.slice(0, 8)}
          onInsert={props.onInsert}
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
