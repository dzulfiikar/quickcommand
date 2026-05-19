import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CornerDownLeft, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { ParamInputForm } from "../components/ParamInputForm";
import { SnippetForm } from "../components/SnippetForm";
import { SnippetPreviewLine } from "../components/SnippetPreviewLine";
import type { ScreenProps } from "./screen-props";

export function PaletteScreen(props: ScreenProps) {
  const [showForm, setShowForm] = useState(false);
  const [paramSnippet, setParamSnippet] = useState<SnippetRecord | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      props.onQueryChange(query);
    }, 120);
    return () => clearTimeout(timer);
  }, [props.onQueryChange, query]);

  const showEmpty = props.filtered.length === 0;
  const emptyHeadline = useMemo(
    () => (query ? "Nothing matches" : "Save your first snippet"),
    [query],
  );
  const emptyHint = useMemo(
    () =>
      query
        ? "Try a shorter or different word."
        : "Press the + above to add the first one.",
    [query],
  );

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

  function handleKeyDown(event: React.KeyboardEvent) {
    const count = props.filtered.length;
    if (count === 0) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelectedIndex((index) => (index + 1) % count);
        break;
      case "ArrowUp":
        event.preventDefault();
        setSelectedIndex((index) => (index - 1 + count) % count);
        break;
      case "Enter":
        event.preventDefault();
        handleInsert(props.filtered[selectedIndex].id);
        break;
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    await props.onSubmitSnippet(event);
    setShowForm(false);
    props.onNewSnippet();
  }

  if (paramSnippet) {
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="surface mx-auto w-full max-w-[44rem] overflow-hidden"
      >
        <div className="p-5">
          <ParamInputForm
            params={extractParams(paramSnippet.value)}
            snippetTitle={paramSnippet.title}
            onSubmit={handleParamSubmit}
            onCancel={() => setParamSnippet(null)}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="surface mx-auto w-full max-w-[44rem] overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-5 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="section-label">New snippet</p>
                <h2 className="text-[17px] font-semibold tracking-[-0.005em] text-foreground">
                  Save it once, paste it forever
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
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
          </motion.div>
        ) : (
          <motion.div
            key="search"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <input
                ref={inputRef}
                aria-label="Search snippets"
                className="flex-1 bg-transparent text-[16px] text-foreground placeholder:text-muted-foreground outline-none"
                placeholder="Search snippets"
                type="text"
                value={query}
                onChange={(event) => {
                  setSelectedIndex(0);
                  setQuery(event.target.value);
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
                  setShowForm(true);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {showEmpty ? (
              <div className="flex flex-col items-center gap-1 px-5 py-12 text-center">
                <p className="text-[14px] font-semibold text-foreground">
                  {emptyHeadline}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  {emptyHint}
                </p>
              </div>
            ) : (
              <ul className="max-h-[24rem] overflow-y-auto p-2">
                {props.filtered.map((snippet, index) => {
                  const active = index === selectedIndex;
                  return (
                    <li key={snippet.id}>
                      <button
                        type="button"
                        className={cn(
                          "list-item flex w-full items-center gap-3 px-3 py-2.5 text-left",
                          active && "list-item-active",
                        )}
                        onClick={() => handleInsert(snippet.id)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="snippet-preview-title text-[14px] font-medium text-foreground">
                            {getSnippetPreviewText(snippet.title)}
                          </p>
                          <SnippetPreviewLine
                            parts={getSnippetPreviewParts(snippet.value)}
                            className="snippet-preview-value mt-0.5 block font-mono text-[12px] text-muted-foreground"
                          />
                        </div>
                        <div className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground">
                          {snippet.useCount > 0 ? (
                            <span className="font-mono tabular-nums">
                              {snippet.useCount}×
                            </span>
                          ) : null}
                          {active ? (
                            <ArrowRight
                              className="h-3.5 w-3.5 text-foreground"
                              aria-hidden="true"
                            />
                          ) : null}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
              {showEmpty ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="kbd">esc</span>
                  Close
                </span>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="kbd">↑↓</span>
                    Move
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="kbd">
                      <CornerDownLeft
                        className="h-3 w-3"
                        aria-hidden="true"
                      />
                    </span>
                    Paste
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="kbd">esc</span>
                    Close
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
