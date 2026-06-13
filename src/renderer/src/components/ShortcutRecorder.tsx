import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { formatShortcut, keyEventToAccelerator } from "@/lib/shortcut";
import { cn } from "@/lib/utils";

/**
 * Press-to-record control for the global shortcut. Replaces hand-typed
 * accelerator strings: the user clicks, presses the combination they want, and
 * the live keystroke is captured and converted to an Electron accelerator. This
 * is the native pattern (System Settings, VS Code, Raycast) and removes any need
 * to know Electron's accelerator syntax.
 */
export function ShortcutRecorder(props: {
  id?: string;
  /** Current accelerator, or null/"" when unset. */
  value: string | null;
  /** Called with a new accelerator, or null when cleared. */
  onChange(value: string | null): void;
  "aria-describedby"?: string;
}) {
  const [recording, setRecording] = useState(false);

  const hasValue = Boolean(props.value?.trim());

  const stop = useCallback(() => setRecording(false), []);

  useEffect(() => {
    if (!recording) return;

    function handleKeyDown(event: KeyboardEvent) {
      // Never let the recorded keys leak to the rest of the app while listening.
      event.preventDefault();
      event.stopPropagation();

      if (event.key === "Escape") {
        setRecording(false);
        return;
      }

      const accelerator = keyEventToAccelerator(event);
      if (accelerator) {
        props.onChange(accelerator);
        setRecording(false);
      }
    }

    // Capture phase so we intercept before any other handler.
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [recording, props.onChange]);

  const glyphs = formatShortcut(props.value);

  return (
    <div className="flex items-center gap-2">
      <button
        id={props.id}
        type="button"
        aria-describedby={props["aria-describedby"]}
        aria-pressed={recording}
        onClick={() => setRecording((on) => !on)}
        onBlur={stop}
        className={cn(
          "pressable flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md border px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          recording
            ? "animate-pulse border-primary bg-[var(--surface-inset)] text-foreground ring-2 ring-primary"
            : "border-border bg-transparent text-foreground hover:border-border-strong hover:bg-secondary/60",
        )}
      >
        {recording ? (
          <span className="text-sm text-muted-foreground">
            Press keys… (Esc to cancel)
          </span>
        ) : hasValue ? (
          <span className="font-mono text-base tracking-wide">{glyphs}</span>
        ) : (
          <span className="text-sm text-muted-foreground">
            Click to record a shortcut
          </span>
        )}
      </button>

      {hasValue && !recording ? (
        <button
          type="button"
          aria-label="Clear shortcut"
          title="Clear shortcut"
          onClick={() => props.onChange(null)}
          className="pressable flex size-11 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground outline-none hover:border-border-strong hover:text-foreground focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
