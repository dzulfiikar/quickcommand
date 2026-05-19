<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-19 | Updated: 2026-05-19 -->

# renderer/src

## Purpose
Renderer source root. Owns the React entry point, the top-level `App` shell that routes window kinds to feature screens, the global stylesheet, and a browser-only mock of the preload API for the standalone preview.

## Key Files

| File | Description |
|------|-------------|
| `main.tsx` | React entry point — mounts `App` into `#root`. |
| `App.tsx` | Top-level shell; loads snippets/settings via `window.quickCommand`, owns shared state, and renders the matching `*Screen` based on `getWindowKind()`. |
| `mock-preload.ts` | In-memory implementation of `QuickCommandAPI` for `bun run dev:browser` so renderer screens work without Electron. |
| `styles.css` | Tailwind 4 layer setup, design tokens, and global utility classes (`status-pill`, motion helpers). |
| `vite-env.d.ts` | Vite client types. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `components/` | Reusable panels, forms, and shadcn/ui primitives (see `components/AGENTS.md`) |
| `features/` | Per-window screen components and screen-local helpers (see `features/AGENTS.md`) |
| `hooks/` | Reserved for shared hooks; currently empty |
| `lib/` | Renderer-only helpers: motion presets, badge config, snippet preview, `cn` (see `lib/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `App.tsx` is the only place that calls `window.quickCommand.app.getWindowKind()` and then routes to a screen. Do not duplicate that switch elsewhere.
- All preload calls flow through `App.tsx` or screen-level handlers it passes down via `ScreenProps`. Avoid scattering `window.quickCommand.*` calls across leaf components.
- The `@/` alias resolves to `src/renderer/src` (configured in `electron.vite.config.ts`). Use `@/components`, `@/lib`, `@/components/ui` for renderer-local imports; use relative paths for `../../shared/*` so the cross-boundary import is visually obvious.
- Browser-preview mode swaps `window.quickCommand` with `mock-preload.ts`. When you add a new API method, extend the mock in the same change so `bun run dev:browser` keeps working.
- Friendly error decoding for Zod messages lives in `friendlyError` inside `App.tsx`; reuse it instead of building a second decoder.

### Testing Requirements
- Component-level tests live in `tests/unit/*.test.tsx`. Renderer-only changes should still pass `bun run typecheck` and `bun run lint`.

### Common Patterns
- Pass screen state and callbacks down through `ScreenProps` (`features/screen-props.ts`) — keep new screens conformant.
- Style with Tailwind utility classes plus tokens from `styles.css`; use `cn()` from `@/lib/utils` to merge variants.

## Dependencies

### Internal
- `src/shared/*` — types and Zod schemas (relative imports)
- `src/preload/index.ts` — runtime contract via `window.quickCommand`

### External
- `react`, `react-dom`, `framer-motion`, `lucide-react`
- `tailwindcss`, `clsx`, `tailwind-merge`

<!-- MANUAL: -->
