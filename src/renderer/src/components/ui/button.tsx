import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "pressable inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-base font-medium whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/24 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(180deg,var(--primary-bright),var(--primary-deep))] text-primary-foreground shadow-[var(--accent-glow),inset_0_1px_0_oklch(1_0_0_/_25%)] hover:brightness-[1.06] active:brightness-95",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_1px_2px_oklch(0_0_0_/_22%)] hover:bg-destructive/88 focus-visible:ring-destructive/30",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-secondary/60 hover:border-border-strong",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[inset_0_1px_0_var(--highlight)] hover:bg-secondary/80",
        ghost:
          "text-muted-foreground hover:bg-secondary/55 hover:text-foreground",
        link: "text-accent-text underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2 text-base has-[>svg]:px-3",
        xs: "h-11 gap-1.5 rounded-md px-3 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-11 gap-1.5 rounded-md px-4 text-base has-[>svg]:px-3",
        lg: "h-12 rounded-md px-6 text-md has-[>svg]:px-4",
        icon: "size-11",
        "icon-xs": "size-11 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-11",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
