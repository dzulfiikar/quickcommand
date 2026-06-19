import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-28 w-full rounded-md border border-border-strong bg-input px-3 py-2.5 font-mono text-base leading-relaxed shadow-[inset_0_1px_2px_oklch(0_0_0_/_14%)] transition-[background-color,border-color,box-shadow] outline-none placeholder:text-muted-foreground hover:border-[color-mix(in_oklch,var(--foreground)_22%,transparent)] focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-focus-ring/70 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/24",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
