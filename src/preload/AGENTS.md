<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-19 | Updated: 2026-05-19 -->

# preload

## Purpose
Sandboxed bridge between the Electron renderer and main process. Exposes a typed `window.quickCommand` object via `contextBridge` and forwards renderer error/rejection events to the diagnostics channel.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` | Builds the `QuickCommandAPI` object and binds every IPC channel; also installs `error` and `unhandledrejection` listeners that report to `channels.diagnosticsLog`. |

## For AI Agents

### Working In This Directory
- The implementation must match `src/shared/app-api.ts` exactly — the `QuickCommandAPI` import is the contract.
- Every method here must use a constant from `src/main/ipc/channels.ts`. Do not hardcode channel strings.
- Window-kind detection (`getWindowKind`) parses `window.location.hash`; keep the four supported hashes in sync with `shared/app-api.ts` `WindowKind` and the main-process window loaders.
- Event subscriptions must return an unsubscribe function and must use `ipcRenderer.removeListener` with the same listener reference.
- The bundle must remain **CommonJS**. Any change here that affects the build output should keep `tests/unit/preload-config.test.ts` green.

### Testing Requirements
- Behavior changes ride on `tests/unit/preload-config.test.ts` and the integration coverage in `tests/integration/snippet-ipc.test.ts` and `tests/integration/paste-flow.test.ts`.

### Common Patterns
- Each domain (`snippets`, `settings`, `app`) groups one logical surface area. Keep new methods inside the relevant group.
- Diagnostics reporting is fire-and-forget via `ipcRenderer.send`, never `invoke`.

## Dependencies

### Internal
- `src/main/ipc/channels.ts` — channel name constants
- `src/shared/app-api.ts` — typed contract

### External
- `electron` — `contextBridge`, `ipcRenderer`

<!-- MANUAL: -->
