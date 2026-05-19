import { motion } from "framer-motion";
import {
  Calendar,
  ClipboardPaste,
  Hash,
  Info,
  Plus,
  Settings,
  Shield,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fadeIn } from "@/lib/motion";
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
import { SearchBar } from "../components/SearchBar";
import { SettingsPanel } from "../components/SettingsPanel";
import { SnippetForm } from "../components/SnippetForm";
import { SnippetPreviewLine } from "../components/SnippetPreviewLine";
import type { ScreenProps } from "./screen-props";
import {
  getLibraryPageForItemId,
  getLibraryPageItems,
  getLibraryPaginationState,
} from "./tray-pagination";

type DetailView = "snippet" | "about";

export function LibraryScreen(props: ScreenProps) {
  const [paramSnippet, setParamSnippet] = useState<SnippetRecord | null>(null);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<SnippetRecord | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [detailView, setDetailView] = useState<DetailView>("snippet");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const settingsTitleId = useId();
  const settingsDescriptionId = useId();
  const settingsDialogRef = useRef<HTMLDivElement>(null);
  const settingsTriggerRef = useRef<HTMLButtonElement>(null);
  const closeSettingsRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const { page: clampedPage } = getLibraryPaginationState(
      page,
      props.filtered.length,
    );

    if (clampedPage !== page) {
      setPage(clampedPage);
    }
  }, [page, props.filtered.length]);

  useEffect(() => {
    setConfirmingDelete(false);
  }, [props.editingId]);

  useEffect(() => {
    if (detailView !== "snippet" || !selected) {
      return;
    }

    const pagination = getLibraryPaginationState(page, props.filtered.length);
    const selectedPage = getLibraryPageForItemId(
      props.filtered,
      selected.id,
      pagination.pageSize,
    );

    if (selectedPage === null) {
      setSelected(null);
      props.onNewSnippet();
      return;
    }

    if (selectedPage !== page) {
      setPage(selectedPage);
    }
  }, [detailView, page, props.filtered, props.onNewSnippet, selected]);

  useEffect(() => {
    if (!showSettings) {
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const frame = requestAnimationFrame(() => {
      closeSettingsRef.current?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setShowSettings(false);
        return;
      }

      if (event.key !== "Tab" || !settingsDialogRef.current) {
        return;
      }

      const focusable = Array.from(
        settingsDialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [showSettings]);

  function handleInsert(id: string) {
    const snippet = props.filtered.find((item) => item.id === id);
    if (snippet && hasParams(snippet.value)) {
      setParamSnippet(snippet);
      return;
    }

    void props.onInsert(id);
  }

  function handleParamSubmit(values: Record<string, string>) {
    if (!paramSnippet) {
      return;
    }

    const finalText = substituteParams(paramSnippet.value, values);
    setParamSnippet(null);
    void props.onInsertText(paramSnippet.id, finalText);
  }

  function handleSelectSnippet(snippet: SnippetRecord) {
    setSelected(snippet);
    setDetailView("snippet");
    props.editSnippet(snippet);
  }

  function handleNewSnippet() {
    setSelected(null);
    setDetailView("snippet");
    props.onNewSnippet();
  }

  function handleQueryChange(query: string) {
    setPage(0);
    props.onQueryChange(query);
  }

  function handleShowAbout() {
    setSelected(null);
    setDetailView("about");
  }

  function closeSettings() {
    setShowSettings(false);
  }

  const confirmDelete = useCallback(async () => {
    if (!props.editingId) {
      return;
    }

    const removed = await props.onRemove(props.editingId);
    if (!removed) {
      return;
    }

    setSelected(null);
    setConfirmingDelete(false);
    setDetailView("snippet");
    props.onNewSnippet();
  }, [props]);

  const focusListItem = useCallback((index: number) => {
    const list = document.querySelector<HTMLUListElement>(
      "[data-library-list]",
    );
    const buttons = list?.querySelectorAll<HTMLButtonElement>(
      "button[data-library-row]",
    );
    if (!buttons || buttons.length === 0) return;
    const safe = Math.max(0, Math.min(buttons.length - 1, index));
    buttons[safe].focus();
  }, []);

  function handlePageChange(nextPage: number) {
    const pagination = getLibraryPaginationState(page, props.filtered.length);
    const nextPagination = getLibraryPaginationState(
      nextPage,
      props.filtered.length,
      { pageSize: pagination.pageSize },
    );
    const nextVisibleSnippets = getLibraryPageItems(
      props.filtered,
      nextPagination.page,
      nextPagination.pageSize,
    );

    setPage(nextPagination.page);

    if (detailView !== "snippet" || !selected) {
      return;
    }

    const selectedStillVisible = nextVisibleSnippets.some(
      (snippet) => snippet.id === selected.id,
    );

    if (selectedStillVisible) {
      return;
    }

    const nextSelected = nextVisibleSnippets[0];
    if (nextSelected) {
      handleSelectSnippet(nextSelected);
      return;
    }

    setSelected(null);
    props.onNewSnippet();
  }

  const pagination = getLibraryPaginationState(page, props.filtered.length);
  const visibleSnippets = getLibraryPageItems(
    props.filtered,
    pagination.page,
    pagination.pageSize,
  );

  function handleListKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    snippet: SnippetRecord,
    index: number,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelectSnippet(snippet);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "j") {
      event.preventDefault();
      focusListItem(index + 1);
      return;
    }
    if (event.key === "ArrowUp" || event.key === "k") {
      event.preventDefault();
      focusListItem(index - 1);
    }
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (showSettings) return;
      const target = event.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key === ",") {
        event.preventDefault();
        setShowSettings(true);
        return;
      }

      if (isEditable) return;

      if (event.key === "/") {
        const search = document.querySelector<HTMLInputElement>(
          'input[type="search"]',
        );
        if (search) {
          event.preventDefault();
          search.focus();
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showSettings]);

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="surface flex h-full flex-col overflow-hidden lg:flex-row"
    >
      <aside className="flex w-full shrink-0 flex-col border-b border-border lg:w-[19.5rem] lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <SearchBar
            autoFocus
            label="Search snippets"
            onQueryChange={handleQueryChange}
            placeholder="Search snippets"
          />
          <span
            aria-label={`${props.filtered.length} snippets`}
            className="font-mono text-[11px] tabular-nums text-muted-foreground"
          >
            {props.filtered.length}
          </span>
          <Button
            aria-label="Create a new snippet"
            variant="default"
            size="icon-sm"
            onClick={handleNewSnippet}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          {props.filtered.length === 0 ? (
            <div className="flex flex-col gap-1 px-5 py-10">
              <p className="text-[14px] font-semibold text-foreground">
                No snippets yet
              </p>
              <p className="max-w-[28ch] text-[12.5px] leading-relaxed text-muted-foreground">
                Save a command, reply, or template once. Paste it anywhere with
                your shortcut.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-0.5 p-2" data-library-list>
              {visibleSnippets.map((snippet, index) => (
                <li key={snippet.id}>
                  <button
                    type="button"
                    data-library-row
                    className={cn(
                      "list-item w-full cursor-pointer px-3 py-2.5 text-left",
                      selected?.id === snippet.id && "list-item-active",
                    )}
                    onClick={() => handleSelectSnippet(snippet)}
                    onKeyDown={(event) =>
                      handleListKeyDown(event, snippet, index)
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="snippet-preview-title min-w-0 flex-1 text-[13.5px] font-medium text-foreground">
                        {getSnippetPreviewText(snippet.title)}
                      </p>
                      {snippet.useCount > 0 ? (
                        <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-muted-foreground">
                          {snippet.useCount}×
                        </span>
                      ) : null}
                    </div>
                    <SnippetPreviewLine
                      parts={getSnippetPreviewParts(snippet.value)}
                      className="snippet-preview-value mt-0.5 block font-mono text-[11.5px] text-muted-foreground"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        {pagination.totalPages > 1 ? (
          <div className="flex items-center justify-center gap-3 border-t border-border px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={pagination.page === 0}
              onClick={() => handlePageChange(page - 1)}
            >
              Prev
            </Button>
            <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
              {pagination.page + 1} / {pagination.totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={pagination.page >= pagination.totalPages - 1}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        ) : null}

        <div className="flex items-center gap-1 border-t border-border p-2">
          {props.permissionGranted ? (
            <span className="status-pill status-pill--success flex-1 justify-center">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Accessibility ready
            </span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-2 px-3 status-pill status-pill--warning"
              onClick={() => void props.onAccessibilityOpen()}
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
              Accessibility required
            </Button>
          )}
          <Button
            ref={settingsTriggerRef}
            aria-label="Open settings"
            title="Settings (⌘,)"
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            aria-label="About QuickCommand"
            variant="ghost"
            size="icon-sm"
            onClick={handleShowAbout}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-8 px-6 py-6 md:px-8">
            {paramSnippet ? (
              <ParamInputForm
                params={extractParams(paramSnippet.value)}
                snippetTitle={paramSnippet.title}
                onSubmit={handleParamSubmit}
                onCancel={() => setParamSnippet(null)}
              />
            ) : detailView === "about" ? (
              <AboutPanel
                onCheckForUpdates={props.onCheckForUpdates}
                onClose={() => setDetailView("snippet")}
                onOpenUpdateDownload={props.onOpenUpdateDownload}
                updateChecking={props.updateChecking}
                updateError={props.updateError}
                updateInfo={props.updateInfo}
              />
            ) : (
              <>
                <section className="flex flex-col gap-4">
                  {selected ? (
                    <>
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 space-y-2">
                          <p className="section-label">Snippet</p>
                          <h2 className="snippet-text-wrap text-[22px] font-semibold leading-tight tracking-[-0.015em] text-foreground">
                            {selected.title}
                          </h2>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                              Created{" "}
                              {new Date(
                                selected.createdAt,
                              ).toLocaleDateString()}
                            </span>
                            {selected.lastUsedAt ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Hash
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                Last used{" "}
                                {new Date(
                                  selected.lastUsedAt,
                                ).toLocaleDateString()}
                              </span>
                            ) : null}
                            {hasParams(selected.value) ? (
                              <span className="inline-flex items-center gap-2">
                                {extractParams(selected.value).map((param) => (
                                  <Badge
                                    key={param}
                                    variant="outline"
                                    className="font-mono text-[10.5px]"
                                  >
                                    {`{${param}}`}
                                  </Badge>
                                ))}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <Button
                          className="shrink-0 gap-2"
                          onClick={() => handleInsert(selected.id)}
                        >
                          <ClipboardPaste className="h-4 w-4" />
                          Paste snippet
                        </Button>
                      </div>
                      <pre className="surface-inset snippet-text-wrap whitespace-pre-wrap p-4 font-mono text-[13px] leading-relaxed text-foreground">
                        {selected.value}
                      </pre>
                    </>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="section-label">Detail</p>
                      <h2 className="text-[18px] font-semibold tracking-[-0.005em] text-foreground">
                        Pick a snippet, or write a new one
                      </h2>
                      <p className="max-w-[58ch] text-[13.5px] leading-relaxed text-muted-foreground">
                        Selecting a snippet on the left shows it here for
                        review. The form below is always live for the current
                        draft.
                      </p>
                    </div>
                  )}
                </section>

                <section className="flex flex-col gap-4">
                  <div className="space-y-1">
                    <p className="section-label">
                      {props.editingId ? "Editing" : "New snippet"}
                    </p>
                    <h2 className="text-[15px] font-semibold text-foreground">
                      {props.editingId
                        ? "Edit the selected snippet"
                        : "Save it once, paste it forever"}
                    </h2>
                  </div>
                  <SnippetForm
                    deleteDisabled={props.saving}
                    deleteConfirming={confirmingDelete}
                    draft={props.draft}
                    onChange={props.onDraftChange}
                    onDelete={
                      props.editingId
                        ? () => {
                            setConfirmingDelete(true);
                            return Promise.resolve();
                          }
                        : undefined
                    }
                    onConfirmDelete={
                      props.editingId ? confirmDelete : undefined
                    }
                    onCancelDelete={() => setConfirmingDelete(false)}
                    onSubmit={props.onSubmitSnippet}
                    saving={props.saving}
                  />
                </section>
              </>
            )}
          </div>
        </ScrollArea>
      </main>

      {showSettings && props.settings ? (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "var(--overlay)" }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeSettings();
            }
          }}
        >
          <div
            ref={settingsDialogRef}
            aria-describedby={settingsDescriptionId}
            aria-labelledby={settingsTitleId}
            aria-modal="true"
            className="surface-strong flex max-h-[82vh] w-full max-w-[34rem] flex-col gap-5 overflow-y-auto p-6"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2
                  id={settingsTitleId}
                  className="text-[17px] font-semibold text-foreground"
                >
                  Settings
                </h2>
                <p
                  id={settingsDescriptionId}
                  className="max-w-[44ch] text-[13px] leading-relaxed text-muted-foreground"
                >
                  Shortcut, launch behavior, and the local snippet file. No
                  sync, no account.
                </p>
              </div>
              <Button
                ref={closeSettingsRef}
                aria-label="Close settings"
                variant="ghost"
                size="icon-sm"
                onClick={closeSettings}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SettingsPanel
              onExport={props.onExport}
              onImport={props.onImport}
              settings={props.settings}
              onSaveSettings={props.onSaveSettings}
              showClipboardDelay
            />
          </div>
        </div>
      ) : null}
    </motion.section>
  );
}
