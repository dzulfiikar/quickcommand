import { motion } from "framer-motion";
import {
  ClipboardPaste,
  Info,
  Library,
  LogOut,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fadeIn } from "@/lib/motion";
import {
  getSnippetPreviewParts,
  getSnippetPreviewText,
} from "@/lib/snippet-preview";
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
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="surface flex h-full min-h-0 flex-col overflow-hidden"
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
  const queryInputRef = useRef<HTMLInputElement | null>(null);

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
              <div className="space-y-1">
                <p className="section-label">
                  {props.editingId ? "Editing" : "New"}
                </p>
                <h2 className="text-[17px] font-semibold tracking-[-0.005em] text-foreground">
                  {props.editingId ? "Edit snippet" : "Save it once, paste it forever"}
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

  const pagination = getTrayPaginationState(page, props.filtered.length);
  const visibleSnippets = getTrayPageItems(
    props.filtered,
    pagination.page,
    pagination.pageSize,
  );

  return (
    <TrayShell>
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Search
          className="h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          aria-label="Search snippets"
          className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground outline-none"
          placeholder="Search snippets"
          ref={queryInputRef}
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
        />
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
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

      <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
        {visibleSnippets.length > 0 ? (
          <ScrollArea className="flex-1 min-h-0">
            <ul className="flex flex-col gap-1 p-2">
              {visibleSnippets.map((snippet) => (
                <li
                  key={snippet.id}
                  className="list-item group flex items-center gap-2 px-3 py-2.5"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 cursor-pointer text-left"
                    onClick={() => handleInsert(snippet.id)}
                  >
                    <p className="snippet-preview-title text-[13.5px] font-medium text-foreground">
                      {getSnippetPreviewText(snippet.title)}
                    </p>
                    <SnippetPreviewLine
                      parts={getSnippetPreviewParts(snippet.value)}
                      className="snippet-preview-value mt-0.5 block font-mono text-[11.5px] text-muted-foreground"
                    />
                  </button>
                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <Button
                      aria-label={`Edit ${snippet.title}`}
                      variant="ghost"
                      size="icon-xs"
                      className="size-8"
                      onClick={() => handleEdit(snippet)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      aria-label={`Delete ${snippet.title}`}
                      variant="ghost"
                      size="icon-xs"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => void props.onRemove(snippet.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {snippet.useCount > 0 ? (
                    <span className="font-mono text-[10.5px] tabular-nums text-muted-foreground">
                      {snippet.useCount}×
                    </span>
                  ) : null}
                  <Button
                    aria-label={`Paste ${snippet.title}`}
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 px-3"
                    onClick={() => handleInsert(snippet.id)}
                  >
                    <ClipboardPaste className="h-3.5 w-3.5" />
                    Paste
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-1 px-4 py-10 text-center">
            <p className="text-[14px] font-semibold text-foreground">
              {query ? "Nothing matches" : "No snippets yet"}
            </p>
            <p className="text-[13px] text-muted-foreground">
              {query
                ? "Try a shorter or different word."
                : "Use the actions below to create one."}
            </p>
          </div>
        )}

        {pagination.totalPages > 1 ? (
          <div className="flex items-center justify-center gap-3 border-t border-border px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={pagination.page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
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
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination.totalPages - 1, current + 1),
                )
              }
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>

      <footer className="grid grid-cols-3 gap-1 border-t border-border p-2">
        <button
          className="list-item flex items-center gap-2 px-3 py-3 text-left text-[13px] font-medium text-foreground"
          type="button"
          onClick={() => void props.onShowLibrary()}
        >
          <Library
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          Library
        </button>
        <button
          className="list-item flex items-center gap-2 px-3 py-3 text-left text-[13px] font-medium text-foreground"
          type="button"
          onClick={() => setShowAbout(true)}
        >
          <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          About
        </button>
        <button
          className="list-item flex items-center gap-2 px-3 py-3 text-left text-[13px] font-medium text-destructive"
          type="button"
          onClick={() => void props.onQuit()}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Quit
        </button>
      </footer>
    </TrayShell>
  );
}
