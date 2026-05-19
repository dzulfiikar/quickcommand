<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-19 | Updated: 2026-05-19 -->

# windows

## Purpose
Electron `BrowserWindow` factories for every shipped surface. Each file constructs one window kind with the correct chrome, sandbox flags, and preload binding; shared helpers handle preload path resolution and renderer URL/file loading.

## Key Files

| File | Description |
|------|-------------|
| `shared.ts` | `getPreloadPath(importMetaUrl)` and `preloadBundleFileName` — resolves the packaged preload bundle relative to each window module. |
| `window-loader.ts` | Loads either the dev server URL or the packaged renderer file with the appropriate hash for a given `WindowKind`. |
| `palette-window.ts` | Frameless command-palette window — borderless, always-on-top, shown via global hotkey. |
| `library-window.ts` | Main library window (1080×760, hidden inset title bar, dark background). |
| `onboarding-window.ts` | First-run onboarding window. |
| `tray-popover-window.ts` | Menu-bar tray popover anchored to the tray icon. |

## For AI Agents

### Working In This Directory
- Every `BrowserWindow` must keep `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`, and use `getPreloadPath(import.meta.url)`. Do not regress the sandboxed renderer model.
- Window dimensions, `backgroundColor`, and chrome flags are intentional — match the macOS look already established (`titleBarStyle: "hiddenInset"` on the library, frameless palette).
- Routing into a window happens via the URL hash (`#palette`, `#library`, `#onboarding`, `#tray`). When you add a new window kind, update `shared/app-api.ts` `WindowKind`, `preload/index.ts` `getWindowKind`, and `window-loader.ts` together.
- Show/hide/focus orchestration belongs in `src/main/app.ts` (or a tray manager), not inside these factories — these files only **construct** the window.

### Testing Requirements
- Preload bundle resolution is regression-tested by `tests/unit/preload-config.test.ts`. Keep it green when changing `shared.ts` or `electron.vite.config.ts`.

### Common Patterns
- Each factory returns a `BrowserWindow` with `show: false`; the caller decides when to display it.
- Reuse `shared.ts` for preload path resolution rather than recomputing relative paths inline.

## Dependencies

### Internal
- `src/preload/index.ts` (compiled bundle) — referenced via `shared.ts`

### External
- `electron` — `BrowserWindow`
- `node:path`, `node:url`

<!-- MANUAL: -->
