import { motion } from "framer-motion";
import { BookOpen, Info, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useReportContentHeight } from "@/hooks/useReportContentHeight";
import { surfaceIn } from "@/lib/motion";
import {
  getSnippetPreviewParts,
  getSnippetPreviewText,
} from "@/lib/snippet-preview";
import { cn } from "@/lib/utils";
import {
  extractParams,
  hasParams,
  substituteParams,
} from "../../../shared/cursor-placeholder";
import type { SnippetRecord } from "../../../shared/snippet-model";
import { AboutPanel } from "../components/AboutPanel";
import { ParamInputForm } from "../components/ParamInputForm";
import { SnippetForm } from "../components/SnippetForm";
import { SnippetPreviewLine } from "../components/SnippetPreviewLine";
import type { ScreenProps } from "./screen-props";
import { getTrayPageItems, getTrayPaginationState } from "./tray-pagination";

function TrayShell(props: { children: React.ReactNode }) {
  const shellRef = useReportContentHeight<HTMLDivElement>();
  return (
    <motion.div
      ref={shellRef}
      variants={surfaceIn}
      initial="hidden"
      animate="visible"
      className="surface-float mx-auto flex w-full flex-col overflow-hidden"
    >
      {props.children}
    </motion.div>
  );
}

export function TrayScreen(props: ScreenProps) {
  const [paramSnippet, setParamSnippet] = useState<SnippetRecord | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const queryInputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    queryInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      props.onQueryChange(query);
    }, 120);
    return () => clearTimeout(timer);
  }, [props.onQueryChange, query]);

  useEffect(() => {
    const { page: clampedPage } = getTrayPaginationState(
      page,
      props.filtered.length,
    );

    if (clampedPage !== page) {
      setPage(clampedPage);
    }
  }, [page, props.filtered.length]);

  const pagination = getTrayPaginationState(page, props.filtered.length);
  const visibleSnippets = useMemo(
    () =>
      getTrayPageItems(props.filtered, pagination.page, pagination.pageSize),
    [props.filtered, pagination.page, pagination.pageSize],
  );

  useEffect(() => {
    setActiveIndex((current) =>
      visibleSnippets.length === 0
        ? 0
        : Math.min(current, visibleSnippets.length - 1),
    );
  }, [visibleSnippets.length]);

  function handleInsert(id: string) {
    const snippet = props.filtered.find((item) => item.id === id);
    if (snippet && hasParams(snippet.value)) {
      setParamSnippet(snippet);
      return;
    }

    void props.onInsert(id);
  }

  function handleEdit(snippet: SnippetRecord) {
    props.editSnippet(snippet);
    setShowEditForm(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    await props.onSubmitSnippet(event);
    setShowEditForm(false);
    props.onNewSnippet();
  }

  function handleParamSubmit(values: Record<string, string>) {
    if (!paramSnippet) {
      return;
    }

    const finalText = substituteParams(paramSnippet.value, values);
    setParamSnippet(null);
    void props.onInsertText(paramSnippet.id, finalText);
  }

  function focusRow(index: number) {
    if (visibleSnippets.length === 0) return;
    const safe = Math.max(0, Math.min(visibleSnippets.length - 1, index));
    setActiveIndex(safe);
    const row = listRef.current?.querySelectorAll<HTMLButtonElement>(
      "button[data-tray-row]",
    )?.[safe];
    row?.focus();
  }

  function handleSearchKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusRow(0);
      return;
    }
    if (event.key === "Enter" && visibleSnippets.length > 0) {
      event.preventDefault();
      handleInsert(visibleSnippets[activeIndex]?.id ?? visibleSnippets[0].id);
      return;
    }
    if (event.key === "Escape" && query.length > 0) {
      event.preventDefault();
      setQuery("");
      setPage(0);
    }
  }

  function handleRowKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    snippet: SnippetRecord,
    index: number,
  ) {
    if (event.key === "ArrowDown" || event.key === "j") {
      event.preventDefault();
      if (index < visibleSnippets.length - 1) {
        focusRow(index + 1);
      } else if (pagination.page < pagination.totalPages - 1) {
        setPage(pagination.page + 1);
        setActiveIndex(0);
      }
      return;
    }
    if (event.key === "ArrowUp" || event.key === "k") {
      event.preventDefault();
      if (index > 0) {
        focusRow(index - 1);
      } else if (pagination.page > 0) {
        setPage(pagination.page - 1);
        setActiveIndex(pagination.pageSize - 1);
      } else {
        queryInputRef.current?.focus();
      }
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      handleInsert(snippet.id);
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "h") {
      if (pagination.page > 0) {
        event.preventDefault();
        setPage(pagination.page - 1);
        setActiveIndex(0);
      }
      return;
    }
    if (event.key === "ArrowRight" || event.key === "l") {
      if (pagination.page < pagination.totalPages - 1) {
        event.preventDefault();
        setPage(pagination.page + 1);
        setActiveIndex(0);
      }
      return;
    }
    if ((event.key === "e" || event.key === "E") && !event.metaKey) {
      event.preventDefault();
      handleEdit(snippet);
      return;
    }
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      void props.onRemove(snippet.id);
    }
  }

  if (showAbout) {
    return (
      <TrayShell>
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-5">
            <AboutPanel
              onCheckForUpdates={props.onCheckForUpdates}
              onClose={() => setShowAbout(false)}
              onOpenUpdateDownload={props.onOpenUpdateDownload}
              updateChecking={props.updateChecking}
              updateError={props.updateError}
              updateInfo={props.updateInfo}
            />
          </div>
        </ScrollArea>
      </TrayShell>
    );
  }

  if (paramSnippet) {
    return (
      <TrayShell>
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-5">
            <ParamInputForm
              params={extractParams(paramSnippet.value)}
              snippetTitle={paramSnippet.title}
              onSubmit={handleParamSubmit}
              onCancel={() => setParamSnippet(null)}
            />
          </div>
        </ScrollArea>
      </TrayShell>
    );
  }

  if (showEditForm) {
    return (
      <TrayShell>
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-5 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="pane-header">
                <p className="section-label">
                  {props.editingId ? "Editing" : "New"}
                </p>
                <h2 className="pane-title-sm">
                  {props.editingId
                    ? "Edit snippet"
                    : "Save it once, paste it forever"}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEditForm(false);
                  props.onNewSnippet();
                }}
              >
                Close
              </Button>
            </div>
            <SnippetForm
              draft={props.draft}
              onChange={props.onDraftChange}
              onSubmit={handleSubmit}
              saving={props.saving}
            />
          </div>
        </ScrollArea>
      </TrayShell>
    );
  }

  return (
    <TrayShell>
      <header className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <span
          aria-hidden="true"
          className="shrink-0 select-none font-mono text-md font-bold leading-none text-accent-text"
        >
          ▸
        </span>
        <input
          aria-label="Search snippets"
          className="flex-1 bg-transparent font-mono text-md text-foreground placeholder:text-muted-foreground outline-none"
          placeholder="Search snippets"
          ref={queryInputRef}
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
            setActiveIndex(0);
          }}
          onKeyDown={handleSearchKeyDown}
        />
        <span
          aria-label={`${props.filtered.length} snippets`}
          className="font-mono text-xs tabular-nums text-muted-foreground"
        >
          {props.filtered.length}
        </span>
        <Button
          aria-label="Create a new snippet"
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            props.onNewSnippet();
            setShowEditForm(true);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </header>

      <div className="flex min-h-0 flex-col overflow-hidden">
        {visibleSnippets.length > 0 ? (
          <ScrollArea className="max-h-[22rem] min-h-0">
            <ul
              ref={listRef}
              className="flex flex-col gap-px p-2"
              role="listbox"
              aria-label="Snippets"
            >
              {visibleSnippets.map((snippet, index) => {
                const isActive = index === activeIndex;
                return (
                  <li
                    key={snippet.id}
                    className={cn(
                      "list-item group relative flex items-center gap-2 px-3",
                      isActive && "list-item-active",
                    )}
                  >
                    <button
                      type="button"
                      data-tray-row
                      role="option"
                      aria-selected={isActive}
                      tabIndex={isActive ? 0 : -1}
                      className="flex h-10 min-w-0 flex-1 cursor-pointer items-center gap-3 text-left outline-none"
                      onClick={() => handleInsert(snippet.id)}
                      onFocus={() => setActiveIndex(index)}
                      onMouseEnter={() => setActiveIndex(index)}
                      onKeyDown={(event) =>
                        handleRowKeyDown(event, snippet, index)
                      }
                    >
                      <p className="snippet-preview-title min-w-0 shrink-0 max-w-[40%] text-base font-medium text-foreground">
                        {getSnippetPreviewText(snippet.title)}
                      </p>
                      <SnippetPreviewLine
                        parts={getSnippetPreviewParts(snippet.value)}
                        className="snippet-preview-value block min-w-0 flex-1 font-mono text-xs text-muted-foreground"
                      />
                      {snippet.useCount > 0 ? (
                        <span className="count-chip shrink-0">
                          {snippet.useCount}
                        </span>
                      ) : null}
                    </button>
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      <Button
                        aria-label={`Edit ${snippet.title}`}
                        variant="ghost"
                        size="icon-sm"
                        tabIndex={-1}
                        onClick={() => handleEdit(snippet)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        aria-label={`Delete ${snippet.title}`}
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        tabIndex={-1}
                        onClick={() => void props.onRemove(snippet.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center">
            <p className="text-md font-semibold text-foreground">
              {query ? "Nothing matches" : "No snippets yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {query ? (
                <>
                  Try a shorter word, or press <kbd className="kbd">Esc</kbd> to
                  clear.
                </>
              ) : (
                <>
                  Press <kbd className="kbd">+</kbd> above to create your first
                  one.
                </>
              )}
            </p>
          </div>
        )}

        <div className="statusbar justify-between px-4 py-1.5">
          <div className="flex items-center gap-3">
            {visibleSnippets.length > 0 ? (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="kbd">↵</kbd>
                  <span>Paste</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="kbd">E</kbd>
                  <span>Edit</span>
                </span>
              </>
            ) : null}
          </div>
          {pagination.totalPages > 1 ? (
            <div className="flex items-center gap-1">
              <Button
                aria-label="Previous page"
                variant="ghost"
                size="icon-sm"
                disabled={pagination.page === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                <span aria-hidden="true">←</span>
              </Button>
              <span className="font-mono tabular-nums">
                {pagination.page + 1} / {pagination.totalPages}
              </span>
              <Button
                aria-label="Next page"
                variant="ghost"
                size="icon-sm"
                disabled={pagination.page >= pagination.totalPages - 1}
                onClick={() =>
                  setPage((current) =>
                    Math.min(pagination.totalPages - 1, current + 1),
                  )
                }
              >
                <span aria-hidden="true">→</span>
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <footer className="grid grid-cols-3 gap-1 border-t border-border p-2">
        <button
          className="list-item pressable !flex flex-col items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-foreground"
          type="button"
          onClick={() => void props.onShowLibrary()}
        >
          <BookOpen
            className="h-[18px] w-[18px] text-muted-foreground"
            aria-hidden="true"
          />
          Library
        </button>
        <button
          className="list-item pressable !flex flex-col items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-foreground"
          type="button"
          onClick={() => setShowAbout(true)}
        >
          <Info
            className="h-[18px] w-[18px] text-muted-foreground"
            aria-hidden="true"
          />
          About
        </button>
        <button
          className="list-item pressable group/quit !flex flex-col items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-muted-foreground hover:!bg-destructive/12 hover:!text-destructive"
          type="button"
          onClick={() => void props.onQuit()}
        >
          <LogOut
            className="h-[18px] w-[18px] text-muted-foreground transition-colors group-hover/quit:text-destructive"
            aria-hidden="true"
          />
          Quit
        </button>
      </footer>
    </TrayShell>
  );
}
