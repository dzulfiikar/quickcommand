# Renderer

## Package Identity

- `src/renderer/` contains the React renderer for the library, palette, onboarding, and tray surfaces.
- The renderer is built with React 19, Tailwind 4, Framer Motion, and the `@/` alias that points at `src/renderer/src`.

## Setup And Run

- Start the Electron app: `bun run dev`
- Start the browser-only preview: `bun run dev:browser`
- Run renderer-focused unit tests: `bun test tests/unit/library-header-badges.test.ts`
- Run another common UI helper test: `bun test tests/unit/snippet-preview.test.ts`
- Typecheck: `bun run typecheck`
- Lint: `bun run lint`

## Patterns And Conventions

- `src/renderer/src/App.tsx` owns shared renderer state, preload API calls, and the window-kind switch. Keep new UI flows compatible with `window.quickCommand.app.getWindowKind()`.
- Put screen-level flows in `src/renderer/src/features/*Screen.tsx`. Keep screen-specific helpers close to the feature, as in `src/renderer/src/features/tray-pagination.ts`.
- Put reusable panels and forms in `src/renderer/src/components/*`. Keep base primitives under `src/renderer/src/components/ui/*`.
- Use `@/` imports for renderer-local modules. Import cross-process models from `src/shared` via relative paths so it is obvious when a change crosses the renderer boundary.
- Reuse the current styling and motion utilities from `src/renderer/src/styles.css`, `src/renderer/src/lib/motion.ts`, and `src/renderer/src/lib/utils.ts` instead of introducing a second styling system.
- For browser preview work, use `src/renderer/src/mock-preload.ts` rather than sprinkling ad hoc `window.quickCommand` guards through components.
- If a renderer change needs new IPC or preload behavior, update `src/preload/index.ts`, `src/shared/app-api.ts`, and the matching main-process handler in the same task.
- If shipped UI changes visibly, update `README.md` screenshots and the `screenshots/` folder with the same change.

## Key Files

- `src/renderer/src/App.tsx`
- `src/renderer/src/features/LibraryScreen.tsx`
- `src/renderer/src/features/PaletteScreen.tsx`
- `src/renderer/src/components/SettingsPanel.tsx`
- `src/renderer/src/styles.css`

## JIT Index Hints

- Find preload API usage: `rg -n "window\\.quickCommand" src/renderer/src`
- Find screen entrypoints: `rg -n "export function .*Screen|export const .*Screen" src/renderer/src/features`
- Find UI primitives and wrappers: `rg -n "@/components/ui" src/renderer/src`
- Find motion usage: `rg -n "motion\\.|fadeIn|AnimatePresence" src/renderer/src`

## Common Gotchas

- Keep window-kind strings aligned across `src/shared/app-api.ts`, `src/preload/index.ts`, and the renderer hash parsing in `App.tsx`.
- `src/renderer/src/hooks/` currently has no established pattern. Do not add abstraction there unless the hook is reused across screens.

## Pre-PR Checks

- `bun test tests/unit && bun run typecheck && bun run lint`
