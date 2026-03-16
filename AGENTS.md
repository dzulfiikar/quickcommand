# QuickCommand

## Project Snapshot

- Single-app repository for the shipped macOS utility `QuickCommand`.
- Active stack: `Electron 41 + TypeScript + React 19 + Bun`, plus a native Swift helper for Accessibility and paste automation.
- Core app code lives in `src/main`, `src/preload`, `src/renderer/src`, and `src/shared`.
- Product and architecture history lives in `docs/plans/`, with the current baseline plan in `docs/plans/2026-03-11-quickcommand-product-plan.md`.
- Keep this root file lightweight and defer area-specific guidance to the nearest nested `AGENTS.md`.

## Root Setup Commands

- Install dependencies: `bun install`
- Start the Electron app: `bun run dev`
- Start the renderer-only preview: `bun run dev:browser`
- Run all tests: `bun test`
- Run unit tests only: `bun test tests/unit`
- Run integration tests only: `bun test tests/integration`
- Typecheck: `bun run typecheck`
- Lint: `bun run lint`
- Build the Swift helper: `bun run build:helper`
- Build the app: `bun run build`
- Package a local macOS app bundle: `bun run package:dir`

## Agent Workflow

- Use relevant local skills whenever they apply instead of improvising workflow.
- Default process expectations:
  - Use `brainstorming` before feature expansion or notable UX changes.
  - Use `test-driven-development` before implementing features or fixes.
  - Use `systematic-debugging` before fixing bugs or unexpected behavior.
  - Use `verification-before-completion` before claiming work is complete.
  - Use `requesting-code-review` before merge or final handoff.
- Use `writing-plans` when converting a product plan into an implementation task list.
- Before editing files in a subdirectory that has its own `AGENTS.md`, read and follow the closer file.

## Documentation Sources

- Use MCP Context7 as the primary source for package and library documentation.
- Required flow for third-party library docs:
  - Run `resolve-library-id`.
  - Run `get-library-docs`.
- Fall back to official vendor docs or targeted web search only when Context7 is missing the package or the needed topic.
- Prefer official documentation and primary sources over blog posts, tutorials, or summaries.

## Repository Map

- `src/main/`: Electron lifecycle, tray/window management, IPC, and native-service orchestration. See `src/main/AGENTS.md`.
- `src/renderer/`: React renderer UI, Tailwind styling, and browser preview entry. See `src/renderer/AGENTS.md`.
- `src/preload/index.ts`: secure `contextBridge` surface; keep it aligned with `src/shared/app-api.ts` and main-process channels.
- `src/shared/`: Zod-backed shared models and cross-process TypeScript contracts.
- `tests/`: Bun unit and integration coverage. See `tests/AGENTS.md`.
- `docs/plans/`: dated implementation and product plans. See `docs/plans/AGENTS.md`.
- `native/quickcommand-helper/`: Swift helper binary source for Accessibility checks, settings deep links, paste, and caret movement. See `native/quickcommand-helper/AGENTS.md` and rebuild with `bun run build:helper` when its contract changes.
- `scripts/`: repository scripts such as `scripts/build-helper.ts`.
- `.github/`: assistant/editor notes plus the release workflow.

## Quick Find Commands

- List repository files: `rg --files`
- Check repo status: `git status --short`
- Find cross-process API touchpoints: `rg -n "window\\.quickCommand|QuickCommandAPI|channels\\." src`
- Find Electron window and lifecycle code: `rg -n "create.*Window|register.*Handlers|globalShortcut|Tray" src/main`
- Find renderer screens and UI primitives: `rg -n "Screen\\(|@/components/ui|window\\.quickCommand" src/renderer/src`
- Find plan metadata and history: `rg -n "^> Created:|^> Last Updated:|^> Plan State:|^## History|^## Verification Notes" docs/plans`
- Find native helper contract usage: `rg -n "check-accessibility|prompt-accessibility|paste|move-left|NativeHelperService" native src/main`
- Find tests for a subsystem: `rg -n "describe\\(|it\\(|test\\(" tests`

## Definition of Done

- Relevant plan docs are updated when scope or state changed.
- `Last Updated` and `History` stay consistent for any modified plan file.
- The nearest `AGENTS.md` guidance is reflected in the change.
- Appropriate verification ran for the touched area:
  - TypeScript behavior or API changes: `bun test` and `bun run typecheck`
  - Renderer-only styling/UI changes: targeted `bun test` coverage, `bun run typecheck`, and `bun run lint`
  - Native helper or packaging changes: `bun run build:helper` and `bun run build`
- Any changed docs remain accurate to the current repository state.
