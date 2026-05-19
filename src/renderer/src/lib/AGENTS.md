<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-19 | Updated: 2026-05-19 -->

# lib

## Purpose
Renderer-only helpers shared across screens and components. Pure functions for class-name merging, motion presets, status pill configuration, and snippet preview rendering. No IPC, no React component code.

## Key Files

| File | Description |
|------|-------------|
| `utils.ts` | `cn(...inputs)` — `clsx` + `tailwind-merge` helper used everywhere for conditional Tailwind classes. |
| `motion.ts` | Framer Motion presets (fade-in, transitions) reused across screens for a consistent motion vocabulary. |
| `library-header-badges.ts` | `getLibraryShortcutBadge` / `getLibraryAccessibilityBadge` — derive status-pill className + label from current state. |
| `snippet-preview.ts` | Builds the truncated, cursor-aware preview text shown next to snippets; covered by `tests/unit/snippet-preview.test.ts`. |

## For AI Agents

### Working In This Directory
- Keep modules **pure**. No `window.quickCommand`, no React components, no module-level side effects.
- Treat helpers here as the canonical source — do not duplicate `cn`, motion presets, or badge logic at call sites.
- When adding a helper that's only used by one screen, put it next to that screen in `features/` (e.g., `features/tray-pagination.ts`). This directory is for cross-feature helpers.
- Status-pill class names rely on `status-pill`, `status-pill--success`, and `status-pill--warning` tokens defined in `styles.css`. Add new variants there before using them here.

### Testing Requirements
- Pure helpers ship with unit tests: `tests/unit/library-header-badges.test.ts`, `tests/unit/snippet-preview.test.ts`. New helpers should follow that pattern.

### Common Patterns
- Functions return plain data (`{ className, label }`) so callers stay declarative.
- Motion presets are exported as objects, not hooks, so they compose with `motion.<element>` props directly.

## Dependencies

### External
- `clsx`, `tailwind-merge` — `cn`
- `framer-motion` — motion presets

<!-- MANUAL: -->
