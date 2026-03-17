import { motion } from "framer-motion";
import {
  Calendar,
  ClipboardPaste,
  Hash,
  Info,
  Plus,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import { SearchBar } from "../components/SearchBar";
import { SettingsPanel } from "../components/SettingsPanel";
import { SnippetForm } from "../components/SnippetForm";
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

  useEffect(() => {
    if (props.query !== undefined) {
      setPage(0);
    }
  }, [props.query]);

  useEffect(() => {
    const { page: clampedPage } = getLibraryPaginationState(
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

  function handleParamSubmit(values: Record<string, string>) {
    if (!paramSnippet) return;
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

  function handleShowAbout() {
    setSelected(null);
    setDetailView("about");
  }

  async function handleDeleteSnippet() {
    if (!props.editingId) {
      return;
    }

    const title = props.draft.title.trim() || "this snippet";
    const confirmed = window.confirm(
      `Delete "${title}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    const removed = await props.onRemove(props.editingId);
    if (!removed) {
      return;
    }

    setSelected(null);
    setDetailView("snippet");
    props.onNewSnippet();
  }

  const pagination = getLibraryPaginationState(page, props.filtered.length);
  const visibleSnippets = getLibraryPageItems(
    props.filtered,
    pagination.page,
    pagination.pageSize,
  );

  useEffect(() => {
    if (detailView !== "snippet" || !selected) {
      return;
    }

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
  }, [
    detailView,
    page,
    pagination.pageSize,
    props.filtered,
    props.onNewSnippet,
    selected,
  ]);

  function handlePageChange(nextPage: number) {
    const nextPagination = getLibraryPaginationState(
      nextPage,
      props.filtered.length,
      {
        pageSize: pagination.pageSize,
      },
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

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="glass flex h-full overflow-hidden"
    >
      {/* ── Sidebar ── */}
      <aside className="flex w-64 shrink-0 flex-col h-full bg-accent/20 border-r border-border/30 overflow-hidden">
        {/* Search */}
        <div className="p-3 pb-2">
          <SearchBar
            onQueryChange={props.onQueryChange}
            placeholder="Search snippets…"
          />
        </div>

        {/* Snippet count + New button */}
        <div className="flex items-center justify-between px-4 pb-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Snippets
            <span className="ml-1.5 font-mono text-muted-foreground/60 tabular-nums">
              {props.filtered.length}
            </span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 pressable"
            onClick={handleNewSnippet}
            title="New snippet"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Separator className="bg-border/30" />

        {/* Scrollable snippet list */}
        <ScrollArea className="flex-1 min-h-0">
          {props.filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                No snippets yet
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Create your first command to get started.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-0.5 p-2 list-none">
              {visibleSnippets.map((snippet) => (
                <li key={snippet.id}>
                  <button
                    type="button"
                    className={`pressable w-full text-left rounded-lg px-3 py-2 transition-colors cursor-pointer border border-transparent hover:bg-accent/40 hover:border-border/40 ${
                      selected?.id === snippet.id ? "item-active" : ""
                    }`}
                    onClick={() => handleSelectSnippet(snippet)}
                  >
                    <h3 className="snippet-preview-title text-[13px] font-medium text-foreground leading-tight">
                      {getSnippetPreviewText(snippet.title)}
                    </h3>
                    <p className="snippet-preview-value font-mono text-[11px] text-foreground/50 mt-0.5">
                      {getSnippetPreviewText(snippet.value)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        {pagination.totalPages > 1 && (
          <div className="px-3 py-2 border-t border-border/20 bg-background/10">
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-3 text-[11px]"
                disabled={pagination.page === 0}
                onClick={() => handlePageChange(page - 1)}
              >
                Prev
              </Button>
              <span className="text-[10.5px] font-mono text-muted-foreground tabular-nums">
                {pagination.page + 1} / {pagination.totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-3 text-[11px]"
                disabled={pagination.page >= pagination.totalPages - 1}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        <Separator className="bg-border/30" />

        {/* Sidebar footer */}
        <div className="flex flex-col gap-1 p-3">
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 flex-1 px-2 text-xs gap-1 pressable"
              onClick={() => void props.onAccessibilityOpen()}
            >
              <Shield className="h-3 w-3" />
              Accessibility
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 pressable"
              onClick={() => setShowSettings((v) => !v)}
              title="Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 pressable"
              onClick={handleShowAbout}
              title="About"
            >
              <Info className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* ── Detail panel ── */}
      <main className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-5 flex flex-col gap-5">
            {/* Param input form overlay */}
            {paramSnippet ? (
              <div className="rounded-xl border border-border/50 bg-card/60 p-5">
                <ParamInputForm
                  params={extractParams(paramSnippet.value)}
                  snippetTitle={paramSnippet.title}
                  onSubmit={handleParamSubmit}
                  onCancel={() => setParamSnippet(null)}
                />
              </div>
            ) : detailView === "about" ? (
              /* About panel */
              <div className="rounded-xl border border-border/50 bg-card/60 p-5 flex flex-col gap-3">
                <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border/30">
                  About
                </h2>
                <AboutPanel
                  onCheckForUpdates={props.onCheckForUpdates}
                  onClose={() => setDetailView("snippet")}
                  onOpenUpdateDownload={props.onOpenUpdateDownload}
                  updateChecking={props.updateChecking}
                  updateError={props.updateError}
                  updateInfo={props.updateInfo}
                />
              </div>
            ) : (
              <>
                {/* Selected snippet detail card */}
                {selected && (
                  <div className="rounded-xl border border-border/50 bg-card/60 p-5 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h2 className="snippet-text-wrap text-lg font-semibold text-foreground leading-tight">
                          {selected.title}
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                          {selected.useCount > 0 && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Hash className="h-3 w-3" />
                              Used {selected.useCount}×
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(selected.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="h-8 px-3 text-xs gap-1.5 pressable shrink-0"
                        onClick={() => handleInsert(selected.id)}
                      >
                        <ClipboardPaste className="h-3.5 w-3.5" />
                        Paste
                      </Button>
                    </div>

                    <pre className="snippet-text-wrap rounded-lg bg-background/60 border border-border/40 p-3 font-mono text-[13px] text-foreground/90 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                      {selected.value}
                    </pre>

                    {hasParams(selected.value) && (
                      <div className="flex flex-wrap gap-1.5">
                        {extractParams(selected.value).map((p) => (
                          <Badge
                            key={p}
                            variant="outline"
                            className="font-mono text-[10.5px] px-1.5 py-0 text-primary border-primary/30 bg-primary/5"
                          >
                            {`{${p}}`}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Edit / New form */}
                <div className="rounded-xl border border-border/50 bg-card/60 p-5 flex flex-col gap-3">
                  <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border/30">
                    {props.editingId ? "Edit snippet" : "New snippet"}
                  </h2>
                  <SnippetForm
                    deleteDisabled={props.saving}
                    draft={props.draft}
                    onChange={props.onDraftChange}
                    onDelete={
                      props.editingId ? handleDeleteSnippet : undefined
                    }
                    onSubmit={props.onSubmitSnippet}
                    saving={props.saving}
                  />
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </main>

      {/* ── Settings overlay ── */}
      {showSettings && props.settings && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="glass w-[380px] max-h-[80vh] overflow-y-auto p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Settings
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 pressable"
                onClick={() => setShowSettings(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Separator className="bg-border/30" />
            <SettingsPanel
              onExport={props.onExport}
              onImport={props.onImport}
              settings={props.settings}
              onSaveSettings={props.onSaveSettings}
              showClipboardDelay
            />
          </div>
        </div>
      )}
    </motion.section>
  );
}
