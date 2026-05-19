<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-19 | Updated: 2026-05-19 -->

# ipc

## Purpose
Main-process IPC handlers. Each module registers `ipcMain.handle` (or `ipcMain.on`) bindings for a single domain, validates input with Zod schemas from `src/shared`, and delegates business logic to services in `src/main/services`.

## Key Files

| File | Description |
|------|-------------|
| `channels.ts` | Single source of truth for IPC channel names — exported as `channels` const, used by main, preload, and tests. |
| `snippets.ts` | `registerSnippetHandlers` — list/search/create/update/remove, paste insertion, import/export dialogs. |
| `settings.ts` | Settings get/update plus accessibility check, prompt, and open-system-pane handlers. |
| `automation.ts` | Window control and automation channels (show library/onboarding, hide palette, quit, update download). |
| `diagnostics.ts` | Receives `diagnostics:log` events from the preload error reporter and forwards them to `DiagnosticLogger`. |

## For AI Agents

### Working In This Directory
- Adding a new IPC method takes **four edits** in lockstep:
  1. Add the constant to `channels.ts`.
  2. Add the handler here in the matching domain file (or a new file with a `register*Handlers` export).
  3. Bind it in `src/preload/index.ts`.
  4. Declare its type in `src/shared/app-api.ts`.
- Validate any input that crosses the IPC boundary with the relevant Zod schema (`snippetInputSchema`, `exportBundleSchema`, etc.). Never trust the renderer payload.
- Keep handlers thin: parse input, call a service, return. Business logic belongs in `src/main/services`.
- Paste handlers (`snippets.ts`) deliberately hide the sender window and call `app.hide()` before invoking the helper so macOS restores focus to the previous app. Preserve that order if you touch this code.
- `InsertResult` is a discriminated union — return `{ ok: false, reason: ... }` on every failure path rather than throwing across the IPC boundary.

### Testing Requirements
- Cover new contract-level behavior with `tests/integration/snippet-ipc.test.ts`, `tests/integration/paste-flow.test.ts`, `tests/integration/permissions-gate.test.ts`, or `tests/integration/settings-cycle.test.ts` (whichever matches the domain).

### Common Patterns
- Each module exports a single `register<Domain>Handlers(services, callbacks?)` function called from `src/main/app.ts`.
- Domain handlers that mutate state call `callbacks.onSnippetsChanged()` (or equivalent) so windows can refresh via the `event:snippets-changed` broadcast.

## Dependencies

### Internal
- `src/main/services/app-services.ts` — receives the assembled `AppServices` bundle
- `src/shared/snippet-model.ts`, `src/shared/settings-model.ts` — input validation

### External
- `electron` — `ipcMain`, `dialog`, `BrowserWindow`, `app`

<!-- MANUAL: -->
