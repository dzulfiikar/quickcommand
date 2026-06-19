/**
 * Content-height sizing for the transient floating windows (palette, tray).
 *
 * The renderer floats are content-sized, so when there is little content the
 * window's fixed height leaves an empty transparent void below the card. The
 * renderer measures its rendered height and reports it; main clamps the value
 * and resizes the window to fit, never growing past the original design height
 * (so a long list still scrolls within the maximum).
 */

/** Bounds for a window-height clamp. */
export type WindowHeightBounds = {
  /** Smallest height (px) the window may shrink to. */
  min: number;
  /** Largest height (px) the window may grow to (its original design height). */
  max: number;
};

/**
 * Clamp a requested content height into the window's allowed range.
 *
 * @param requested desired content height (px) reported by the renderer
 * @param bounds min/max bounds for the window
 * @returns a finite height within [min, max]; a non-finite request falls back
 *   to the maximum so a measurement glitch never collapses the window
 */
export function clampWindowHeight(
  requested: number,
  bounds: WindowHeightBounds,
): number {
  if (!Number.isFinite(requested)) {
    return bounds.max;
  }

  return Math.min(bounds.max, Math.max(bounds.min, requested));
}

/** Minimum height (px) any transient float may shrink to. */
export const MIN_TRANSIENT_WINDOW_HEIGHT = 120;
