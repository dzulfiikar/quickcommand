import { motion } from "framer-motion";
import { ClipboardPaste, Pencil, Trash2 } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listItem, staggerContainer } from "@/lib/motion";
import { getSnippetPreviewText } from "@/lib/snippet-preview";
import type { SnippetRecord } from "../../../shared/snippet-model";

export const SnippetList = memo(function SnippetList(props: {
  onEdit(snippet: SnippetRecord): void;
  onInsert(id: string): void;
  onRemove(id: string): Promise<void>;
  pageSize?: number;
  snippets: SnippetRecord[];
}) {
  const [page, setPage] = useState(0);
  const pageSize = props.pageSize ?? 0;
  const isPaginated = pageSize > 0;
  const totalPages = isPaginated
    ? Math.max(1, Math.ceil(props.snippets.length / pageSize))
    : 1;

  useEffect(() => {
    setPage(0);
  }, [props.snippets.length]);

  const visibleSnippets = isPaginated
    ? props.snippets.slice(page * pageSize, (page + 1) * pageSize)
    : props.snippets;

  if (props.snippets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center rounded-lg border border-dashed border-border/60 bg-muted/20">
        <p className="text-sm font-medium text-muted-foreground">
          No snippets yet
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Create your first command to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <motion.ul
        className="space-y-1.5 list-none p-0"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        key={`page-${page}`}
      >
        {visibleSnippets.map((snippet) => (
          <motion.li
            key={snippet.id}
            variants={listItem}
                className="group rounded-lg border border-border/40 bg-card/50 hover:bg-accent/40 hover:border-border/60 transition-colors px-3.5 py-2.5"
          >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="snippet-preview-title text-[13.5px] font-medium text-foreground leading-tight">
                    {getSnippetPreviewText(snippet.title)}
                  </h3>
                  <p className="snippet-preview-value font-mono text-[11.5px] text-foreground/55 mt-0.5">
                    {getSnippetPreviewText(snippet.value)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {snippet.useCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="font-mono text-[10.5px] px-1.5 py-0 h-5 bg-muted/50 text-muted-foreground"
                    >
                      {snippet.useCount}×
                    </Badge>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 px-2.5 text-xs gap-1"
                    onClick={() => void props.onInsert(snippet.id)}
                  >
                    <ClipboardPaste className="h-3 w-3" />
                    Paste
                  </Button>
                </div>
              </div>
              <div className="flex gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-6 px-2 text-[11px] gap-1"
                  onClick={() => props.onEdit(snippet)}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px] text-destructive hover:text-destructive gap-1"
                  onClick={() => void props.onRemove(snippet.id)}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </motion.li>
          ))}
      </motion.ul>
      {isPaginated && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 text-xs"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ‹ Prev
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 text-xs"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next ›
          </Button>
        </div>
      )}
    </>
  );
});
