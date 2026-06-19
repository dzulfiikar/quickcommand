import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-md border border-border-strong bg-input px-3 py-2 font-mono text-base shadow-[inset_0_1px_2px_oklch(0_0_0_/_14%)] transition-[background-color,border-color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground hover:border-[color-mix(in_oklch,var(--foreground)_22%,transparent)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/24",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
