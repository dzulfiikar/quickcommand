<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-19 | Updated: 2026-05-19 -->

# src

## Purpose
Source root for the QuickCommand Electron app. Splits cleanly into a sandboxed renderer, a preload bridge, the main (Node) process, and shared TypeScript contracts.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `main/` | Electron lifecycle, IPC, services, native helper integration (see `main/AGENTS.md`) |
| `preload/` | `contextBridge` surface that exposes `window.quickCommand` to the renderer (see `preload/AGENTS.md`) |
| `renderer/` | React 19 + Tailwind UI for library, palette, onboarding, tray (see `renderer/AGENTS.md`) |
| `shared/` | Zod-backed cross-process models and TypeScript contracts (see `shared/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Each cross-process feature usually touches **four files together**: `shared/app-api.ts` (type), `main/ipc/channels.ts` (constant), `main/ipc/*.ts` (handler), `preload/index.ts` (binding). Update all four in the same change.
- Renderer code must reach the main process only via `window.quickCommand`. Never import from `main/` or `preload/` inside `renderer/`.
- `electron.vite.config.ts` at the repo root governs how each entry is built; preload must remain CommonJS.

### Common Patterns
- Zod schemas in `shared/` are the single source of truth for record shapes — main and renderer both import them.
- Window kinds (`palette` | `library` | `onboarding` | `tray`) are routed via the URL hash; keep the strings consistent across `shared/app-api.ts`, `preload/index.ts`, and renderer hash parsing.

## Dependencies

### External
- `electron` — desktop runtime
- `react`, `framer-motion`, `tailwindcss` — renderer UI
- `zod` — shared validation

<!-- MANUAL: -->
