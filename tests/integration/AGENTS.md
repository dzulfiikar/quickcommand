<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-19 | Updated: 2026-05-19 -->

# integration

## Purpose
Cross-module contract tests for IPC handlers, paste flow, permissions gating, and settings round-trips. These run with `bun test` and stay lightweight — they do not launch a real Electron BrowserWindow.

## Key Files

| File | Description |
|------|-------------|
| `snippet-ipc.test.ts` | End-to-end snippet CRUD/import/export through `registerSnippetHandlers` against real `JsonSnippetRepository` instances. |
| `paste-flow.test.ts` | Paste insertion contract: permission check → window hide → helper paste → snippet `markInserted` → result shape. |
| `permissions-gate.test.ts` | Verifies the Accessibility-trust gate returns the correct `InsertResult` reasons. |
| `settings-cycle.test.ts` | Settings get/update cycle and persistence through the IPC handler. |

## For AI Agents

### Working In This Directory
- Tests here mock `electron` only where strictly necessary (e.g., `ipcMain`, `dialog`, `BrowserWindow.fromWebContents`). Keep services real so the contract is meaningful.
- Use `mkdtemp` for any file-backed service. Never pollute project paths.
- New IPC handlers should land with an integration test covering at least one success path and one failure path (e.g., `not_trusted`, `helper_failed`, `clipboard_restore_failed` for paste).
- Avoid asserting on private implementation details — assert on the IPC return shape (`InsertResult`, `SnippetRecord`, `Settings`) so refactors don't break the test.
- These tests are not a substitute for a launched Electron app; UI behavior belongs in renderer unit tests.

### Testing Requirements
- Run a single test: `bun test tests/integration/<file>.test.ts`
- Run all integration tests: `bun test tests/integration`

### Common Patterns
- Each test file builds its own `AppServices` bundle pointed at temp paths, then calls `register*Handlers(services, callbacks)` and exercises handlers via `ipcMain.handle` invocation seams.
- Failure paths simulate dependency errors (helper rejection, missing file, etc.) and assert the `InsertResult` discriminated-union output.

## Dependencies

### Internal
- `src/main/ipc/*` — handlers under test
- `src/main/services/*` — real service implementations
- `src/shared/*` — schemas and types

### External
- `bun:test`
- `electron` — partial usage (mocked at the IPC seam)

<!-- MANUAL: -->
