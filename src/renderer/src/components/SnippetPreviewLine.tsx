import type { SnippetPreviewPart } from "@/lib/snippet-preview";
import { cn } from "@/lib/utils";

export function SnippetPreviewLine(props: {
  parts: SnippetPreviewPart[];
  className?: string;
  paramClassName?: string;
}) {
  if (props.parts.length === 0) {
    return null;
  }

  return (
    <span className={cn(props.className)}>
      {props.parts.map((part, index) =>
        part.kind === "text" ? (
          <span key={`t-${index}`}>{part.value}</span>
        ) : (
          <span
            key={`p-${index}`}
            className={cn(
              "mx-0.5 inline-flex items-center rounded-sm border border-border-strong bg-secondary/60 px-1 py-px font-mono text-2xs leading-none text-foreground/90 align-middle",
              props.paramClassName,
            )}
          >
            {part.name}
          </span>
        ),
      )}
    </span>
  );
}
