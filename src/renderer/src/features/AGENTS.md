<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-19 | Updated: 2026-05-19 -->

# features

## Purpose
One screen per shipped window plus their screen-local helpers. `App.tsx` picks one of these based on `window.quickCommand.app.getWindowKind()` and feeds it the shared `ScreenProps`.

## Key Files

| File | Description |
|------|-------------|
| `LibraryScreen.tsx` | Main library window — snippet list, search, create/edit form, settings panel, header status pills. |
| `PaletteScreen.tsx` | Compact command palette shown via global hotkey for quick search-and-paste. |
| `OnboardingScreen.tsx` | First-run flow; covered by `tests/unit/onboarding-screen.test.tsx`. |
| `TrayScreen.tsx` | Menu-bar popover screen (paginated snippet list); pagination logic in `tray-pagination.ts`. |
| `screen-props.ts` | `ScreenProps` type — the prop bag every screen receives from `App.tsx`. |
| `tray-pagination.ts` | Pure helpers for tray paging math; covered by `tests/unit/tray-pagination.test.ts`. |

## For AI Agents

### Working In This Directory
- Screens consume callbacks from `ScreenProps` rather than calling `window.quickCommand` directly. Adding a new IPC interaction means adding a callback to `screen-props.ts` and wiring it in `App.tsx`.
- Keep one feature screen per window kind. Adding a new window kind requires changes in `shared/app-api.ts` `WindowKind`, `preload/index.ts` `getWindowKind`, `main/windows/`, and a sibling screen file here.
- Screen-specific helpers (math, derived state, formatting) belong here as plain `.ts` siblings (see `tray-pagination.ts`). Cross-screen helpers go in `@/lib`.
- Header layout/status pills go through `@/lib/library-header-badges` so the library, palette, and tray surfaces stay consistent.
- Animation transitions reuse presets from `@/lib/motion`; do not introduce parallel motion configs.

### Testing Requirements
- Screen-level tests: `tests/unit/onboarding-screen.test.tsx`, `tests/unit/library-screen-a11y.test.ts`, `tests/unit/library-screen-layout.test.ts`, `tests/unit/tray-pagination.test.ts`.
- New screens need at least one a11y-focused test plus coverage of any pure helper they introduce.

### Common Patterns
- Screens are function components that destructure `ScreenProps` once and pass slices down to `components/*` children.
- Heavy lists use `ScrollArea` from `@/components/ui` for consistent scrollbar styling.

## Dependencies

### Internal
- `@/components/*` and `@/components/ui/*` — shared UI building blocks
- `@/lib/*` — motion presets, badge config, snippet preview, `cn`
- `src/shared/*` — types and schemas (relative imports)

### External
- `react`, `framer-motion`, `lucide-react`

<!-- MANUAL: -->
