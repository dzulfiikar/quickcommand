# Main Process

## Package Identity

- `src/main/` owns Electron app startup, tray behavior, window orchestration, IPC handlers, persistence services, search, permissions, and paste automation.
- Treat this directory as the source of truth for desktop behavior that requires Electron or macOS integration.

## Setup And Run

- Start the full app: `bun run dev`
- Run focused unit tests: `bun test tests/unit/search-service.test.ts`
- Run focused integration tests: `bun test tests/integration/paste-flow.test.ts`
- Typecheck the app: `bun run typecheck`
- Build the app bundles: `bun run build`
- Rebuild the Swift helper when native contracts change: `bun run build:helper`

## Patterns And Conventions

- Keep lifecycle and top-level orchestration in `src/main/app.ts`. `src/main/index.ts` should remain a thin entrypoint.
- Add IPC surface area in three places together:
  - channel constant in `src/main/ipc/channels.ts`
  - handler implementation in `src/main/ipc/*.ts`
  - typed preload/shared exposure in `src/preload/index.ts` and `src/shared/app-api.ts`
- Put reusable behavior in services, not inside IPC handlers or window files. Follow the existing split in `src/main/services/snippet-repository.ts`, `src/main/services/settings-store.ts`, and `src/main/services/paste-service.ts`.
- Keep BrowserWindow construction inside `src/main/windows/*` and reuse `src/main/windows/shared.ts` plus `src/main/windows/window-loader.ts` for shared defaults and preload bundle wiring.
- Use `DiagnosticLogger` from `src/main/services/diagnostic-logger.ts` for persistent diagnostics instead of introducing a parallel logging path.
- Preserve the sandboxed renderer model. Do not bypass preload with direct Node or Electron access from renderer code.
- When changing the Swift helper contract, keep command names and stdout semantics aligned with `src/main/services/native-helper-service.ts`.

## Key Files

- `src/main/app.ts`
- `src/main/ipc/channels.ts`
- `src/main/services/app-services.ts`
- `src/main/services/native-helper-service.ts`
- `src/main/windows/shared.ts`

## JIT Index Hints

- Find IPC handlers: `rg -n "register.*Handlers|ipcMain\\.handle" src/main`
- Find Electron window creation: `rg -n "create.*Window|BrowserWindow" src/main/windows src/main/app.ts`
- Find services and their call sites: `rg -n "class .*Service|new .*Service" src/main/services src/main/app.ts`
- Find native-helper usage: `rg -n "helper.run\\(|NativeHelperService|check-accessibility|paste" src/main native`

## Common Gotchas

- Packaged preload must stay CommonJS. Keep `electron.vite.config.ts`, `src/main/windows/shared.ts`, and `tests/unit/preload-config.test.ts` in sync.
- Paste and accessibility changes often span TypeScript, the Swift helper, and integration tests. Do not change only one side of the contract.

## Pre-PR Checks

- `bun test tests/unit tests/integration && bun run typecheck && bun run build`
- If you touched the Swift helper or packaging flow, also run `bun run build:helper`
