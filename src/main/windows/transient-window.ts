/**
 * Transient windows (palette, tray popover) hide themselves when they lose
 * focus. On an accessory app (dock hidden) a freshly shown window can emit a
 * stray `blur` while macOS is still settling key-window status; hiding on that
 * blur makes the window vanish before the user can act. This guard ignores a
 * blur that arrives within a short grace period after the window was shown.
 */

/** Window kinds that hide on blur. */
export type TransientWindowKind = "palette" | "tray";

/**
 * Grace period (ms) after showing during which a blur is treated as spurious.
 * The panel window type normally prevents the stray blur entirely; this is a
 * defensive backstop for the brief window before focus settles.
 */
export const SHOW_BLUR_GRACE_MS = 250;

/**
 * Decide whether a blur event should hide the window.
 * @param shownAt timestamp (ms) the window was last shown
 * @param now current timestamp (ms)
 * @returns true when the window should hide, false to ignore a stray blur
 */
export function shouldHideOnBlur(shownAt: number, now: number): boolean {
  return now - shownAt >= SHOW_BLUR_GRACE_MS;
}
