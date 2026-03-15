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
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fadeIn } from "@/lib/motion";
import { getSnippetPreviewText } from "@/lib/snippet-preview";
import {
  extractParams,
  hasParams,
  substituteParams,
} from "../../../shared/cursor-placeholder";
import type { SnippetRecord } from "../../../shared/snippet-model";
import { AboutPanel } from "../components/AboutPanel";
import { ParamInputForm } from "../components/ParamInputForm";
import { SnippetForm } from "../components/SnippetForm";
import type { ScreenProps } from "./screen-props";
import {
  getTrayPageItems,
  getTrayPaginationState,
} from "./tray-pagination";

function TrayShell(props: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="glass h-full min-h-0 flex flex-col overflow-hidden"
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

  useEffect(() => {
    const timer = setTimeout(() => {
      props.onQueryChange(query);
    }, 120);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

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
    const snippet = props.filtered.find((s) => s.id === id);
    if (snippet && hasParams(snippet.value)) {
      setParamSnippet(snippet);
    } else {
      void props.onInsert(id);
    }
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
    if (!paramSnippet) return;
    const finalText = substituteParams(paramSnippet.value, values);
    setParamSnippet(null);
    void props.onInsertText(paramSnippet.id, finalText);
  }

  if (showAbout) {
    return (
      <TrayShell>
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4">
            <AboutPanel onClose={() => setShowAbout(false)} />
          </div>
        </ScrollArea>
      </TrayShell>
    );
  }

  if (paramSnippet) {
    return (
      <TrayShell>
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4">
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
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {props.editingId ? "Edit Snippet" : "New Snippet"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={() => {
                  setShowEditForm(false);
                  props.onNewSnippet();
                }}
              >
                Cancel
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
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 shrink-0">
        <Search className="h-4 w-4 text-muted-foreground/50 shrink-0" />
        <input
          autoFocus
          className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/60 outline-none"
          placeholder="Search…"
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-1.5 shrink-0">
          <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
            Snippets
          </span>
          <span className="text-[10px] font-mono text-muted-foreground/50 tabular-nums">
            {props.filtered.length}
          </span>
        </div>

        {visibleSnippets.length > 0 ? (
          <ScrollArea className="flex-1 min-h-0">
            <div className="py-1">
              {visibleSnippets.map((snippet) => (
                <div
                  key={snippet.id}
                  className="group pressable flex items-center gap-3 px-4 py-2 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="snippet-preview-title text-[13px] font-medium text-foreground leading-tight">
                      {getSnippetPreviewText(snippet.title)}
                    </p>
                    <p className="snippet-preview-value text-[10.5px] font-mono text-foreground/50 mt-0.5">
                      {getSnippetPreviewText(snippet.value)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {snippet.useCount > 0 && (
                      <span className="text-[10px] font-mono text-muted-foreground/50 tabular-nums mr-1">
                        {snippet.useCount}×
                      </span>
                    )}
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-accent/50 text-muted-foreground/70 hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => handleEdit(snippet)}
                      title="Edit"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground/70 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => void props.onRemove(snippet.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      className="pressable ml-0.5 px-2 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-medium transition-colors flex items-center gap-1"
                      onClick={() => handleInsert(snippet.id)}
                    >
                      <ClipboardPaste className="h-3 w-3" />
                      Paste
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 min-h-0 flex items-center justify-center py-8 text-center">
            <p className="text-[12.5px] text-muted-foreground/60">
              {query ? "No matches" : "No snippets yet"}
            </p>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 px-4 py-2 border-t border-border/20 bg-muted/10 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-[11px]"
              disabled={pagination.page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              Prev
            </Button>
            <span className="text-[10.5px] font-mono text-muted-foreground/60 tabular-nums">
              {pagination.page + 1} / {pagination.totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-[11px]"
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
        )}
      </div>

      <div className="border-t border-border/30 py-1 shrink-0">
        <div className="px-4 py-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
            Actions
          </span>
        </div>
        <button
          className="pressable flex items-center gap-2.5 w-full text-left px-4 py-2 text-[13px] font-medium text-foreground hover:bg-accent/30 transition-colors"
          type="button"
          onClick={() => {
            props.onNewSnippet();
            setShowEditForm(true);
          }}
        >
          <Plus className="h-3.5 w-3.5 text-primary/60" />
          New Snippet
        </button>
        <button
          className="pressable flex items-center gap-2.5 w-full text-left px-4 py-2 text-[13px] font-medium text-foreground hover:bg-accent/30 transition-colors"
          type="button"
          onClick={() => void props.onShowLibrary()}
        >
          <Library className="h-3.5 w-3.5 text-muted-foreground/60" />
          Open Library
        </button>
        <button
          className="pressable flex items-center gap-2.5 w-full text-left px-4 py-2 text-[13px] font-medium text-foreground hover:bg-accent/30 transition-colors"
          type="button"
          onClick={() => setShowAbout(true)}
        >
          <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
          About
        </button>
        <button
          className="pressable flex items-center gap-2.5 w-full text-left px-4 py-2 text-[13px] font-medium text-destructive/70 hover:bg-destructive/5 transition-colors"
          type="button"
          onClick={() => void props.onQuit()}
        >
          <LogOut className="h-3.5 w-3.5" />
          Quit
        </button>
      </div>
    </TrayShell>
  );
}
