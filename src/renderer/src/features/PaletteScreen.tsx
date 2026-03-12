import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { fadeIn } from "@/lib/motion";
import {
  extractParams,
  hasParams,
  substituteParams,
} from "../../../shared/cursor-placeholder";
import type { SnippetRecord } from "../../../shared/snippet-model";
import { ParamInputForm } from "../components/ParamInputForm";
import { SnippetForm } from "../components/SnippetForm";
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
    setSelectedIndex(0);
  }, [props.filtered.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      props.onQueryChange(query);
    }, 120);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

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

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const count = props.filtered.length;
      if (count === 0) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((i) => (i + 1) % count);
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((i) => (i - 1 + count) % count);
          break;
        case "Enter":
          event.preventDefault();
          handleInsert(props.filtered[selectedIndex].id);
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.filtered, selectedIndex],
  );

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
        className="glass p-5 overflow-y-auto"
      >
        <ParamInputForm
          params={extractParams(paramSnippet.value)}
          snippetTitle={paramSnippet.title}
          onSubmit={handleParamSubmit}
          onCancel={() => setParamSnippet(null)}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="glass overflow-y-auto"
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
            className="p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                New Command
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={() => {
                  setShowForm(false);
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
          </motion.div>
        ) : (
          <motion.div
            key="search"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Spotlight-style search bar */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/40">
              <Search className="h-5 w-5 text-muted-foreground/60 shrink-0" />
              <input
                ref={inputRef}
                autoFocus
                className="flex-1 bg-transparent text-[16px] text-foreground placeholder:text-muted-foreground/60 outline-none"
                placeholder="Search commands…"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                className="shrink-0 p-1.5 rounded-md hover:bg-accent/50 transition-colors text-muted-foreground"
                type="button"
                onClick={() => {
                  props.onNewSnippet();
                  setShowForm(true);
                }}
                title="New snippet"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Results */}
            {props.filtered.length > 0 ? (
              <div className="py-1.5 max-h-[320px] overflow-y-auto">
                {props.filtered.map((snippet, index) => (
                  <button
                    key={snippet.id}
                    type="button"
                    className={`pressable w-full text-left px-5 py-2.5 flex items-center gap-3 transition-colors ${
                      index === selectedIndex
                        ? "item-active"
                        : "hover:bg-accent/30"
                    }`}
                    onClick={() => handleInsert(snippet.id)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-medium text-foreground leading-tight truncate">
                        {snippet.title}
                      </p>
                      <p className="text-[11px] font-mono text-foreground/50 mt-0.5 truncate">
                        {snippet.value}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {snippet.useCount > 0 && (
                        <span className="text-[10px] font-mono text-muted-foreground/60 tabular-nums">
                          {snippet.useCount}×
                        </span>
                      )}
                      {index === selectedIndex && (
                        <span className="kbd">↵</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground/60">
                  {query ? "No matching commands" : "No commands yet"}
                </p>
              </div>
            )}

            {/* Footer hints */}
            {props.filtered.length > 0 && (
              <div className="flex items-center justify-center gap-4 px-5 py-2 border-t border-border/30 bg-muted/10">
                <span className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground/60">
                  <span className="kbd">↑↓</span> navigate
                </span>
                <span className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground/60">
                  <span className="kbd">↵</span> paste
                </span>
                <span className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground/60">
                  <span className="kbd">esc</span> close
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
