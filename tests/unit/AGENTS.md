<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-19 | Updated: 2026-05-19 -->

# unit

## Purpose
Bun unit tests for pure logic, file-backed stores, renderer helpers, and component-level a11y/layout invariants. These tests do not boot Electron.

## Key Files

| File | Description |
|------|-------------|
| `snippet-model.test.ts` | Zod schema coverage for `snippetInputSchema`, `snippetRecordSchema`, `exportBundleSchema`. |
| `cursor-placeholder.test.ts` | Cursor placeholder parsing/insertion logic. |
| `settings-store.test.ts` | `JsonSettingsStore` round-trip + defaults using `mkdtemp` fixtures. |
| `snippet-repository.test.ts` | `JsonSnippetRepository` CRUD, import/export, `markInserted`. |
| `search-service.test.ts` | Snippet search ranking and filtering. |
| `update-service.test.ts` | Update-check pure logic. |
| `diagnostic-logger.test.ts` | Diagnostics persistence and rotation. |
| `preload-config.test.ts` | Pins the packaged preload as CommonJS — regression guard for `electron.vite.config.ts` and `windows/shared.ts`. |
| `library-header-badges.test.ts` | Pure status-pill helpers. |
| `snippet-preview.test.ts` | Snippet preview formatting. |
| `tray-pagination.test.ts` | Tray pagination math. |
| `button-targets.test.ts` | Pins minimum tap-target sizing on `Button`. |
| `library-screen-a11y.test.ts`, `library-screen-layout.test.ts` | Library screen a11y and layout invariants. |
| `search-bar-a11y.test.tsx` | Search bar accessibility coverage. |
| `onboarding-screen.test.tsx` | Onboarding flow rendering. |
| `about-panel.test.tsx`, `settings-panel.test.tsx`, `snippet-form.test.tsx` | Component-level rendering and interaction tests. |
| `renderer-theme.test.ts` | Renderer theming/token assertions. |

## For AI Agents

### Working In This Directory
- Use `bun:test` (`describe`, `it`, `expect`). Don't introduce another runner.
- File-backed stores must be tested against a temp directory (`mkdtemp`) — never write into project paths.
- For `.tsx` component tests, mirror the existing helpers used by `snippet-form.test.tsx` and `settings-panel.test.tsx` (DOM rendering, no Electron).
- New shared models, services, or pure helpers must land with at least one unit test.
- A11y-sensitive UI gets a dedicated `*-a11y.test.ts(x)` file (see `library-screen-a11y.test.ts`, `search-bar-a11y.test.tsx`).
- Keep tests deterministic: pin time via fakes/clocks instead of `new Date()` if your subject reads the clock.

### Testing Requirements
- Run a single test: `bun test tests/unit/<file>.test.ts`
- Run all unit tests: `bun test tests/unit`

### Common Patterns
- One subject per file; the filename matches the production module under test.
- Cover at least one happy path and one failure path per public function.

## Dependencies

### Internal
- Production modules under `src/main/services`, `src/shared`, `src/renderer/src/lib`, `src/renderer/src/components`, `src/renderer/src/features`

### External
- `bun:test` — runner and assertions

<!-- MANUAL: -->
