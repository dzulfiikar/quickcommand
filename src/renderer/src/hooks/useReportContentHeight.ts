import { useCallback, useEffect, useRef } from "react";

/**
 * Measure a transient float's rendered content height and report it to the main
 * process so the window can shrink to fit (the "Raycast" behavior). Returns a
 * callback ref to attach to the float's outermost element; it re-observes
 * automatically when the attached node changes (e.g. switching screen branches).
 *
 * We report the float's own height plus the fixed app-shell padding that frames
 * it (`SHELL_PADDING`), so the window sizes to exactly what is painted with no
 * clipped edge. We deliberately do NOT use `documentElement.scrollHeight`: the
 * app shell is `h-[100dvh]`, so the document always equals the window height and
 * could never shrink.
 *
 * The float MUST be natural-height (not `max-h-full` / `h-full`): a float whose
 * height is tied to the window would shrink as the window shrinks, feeding a
 * smaller measurement back and collapsing the window to its header. Measuring a
 * content-driven height keeps the loop stable.
 *
 * Measurement is additive only: it never changes layout, focus, or keyboard
 * handling. Updates are debounced to one report per animation frame, and the
 * call is guarded so the browser preview (mock preload) is a no-op.
 */
/**
 * Vertical padding the app shell adds around a transient float: `main` has
 * `p-4` (16px top + 16px bottom). Reported height = float height + this, so the
 * window content exactly frames the float. Keep in sync with App.tsx's `main`.
 */
const SHELL_PADDING = 32;

export function useReportContentHeight<T extends HTMLElement = HTMLElement>(): (
  node: T | null,
) => void {
  const observerRef = useRef<ResizeObserver | null>(null);
  const frameRef = useRef(0);
  const lastReportedRef = useRef(-1);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      if (frameRef.current !== 0) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return useCallback((node: T | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!node || typeof ResizeObserver === "undefined") {
      return;
    }

    const resize = window.quickCommand?.app?.resizeWindow;
    if (typeof resize !== "function") {
      return;
    }

    const report = () => {
      frameRef.current = 0;
      const floatHeight = node.getBoundingClientRect().height;
      if (floatHeight <= 0) {
        return;
      }
      const height = Math.ceil(floatHeight) + SHELL_PADDING;
      if (height === lastReportedRef.current) {
        return;
      }
      lastReportedRef.current = height;
      void resize(height);
    };

    const observer = new ResizeObserver(() => {
      if (frameRef.current !== 0) {
        return;
      }
      frameRef.current = window.requestAnimationFrame(report);
    });

    observer.observe(node);
    observerRef.current = observer;
  }, []);
}
