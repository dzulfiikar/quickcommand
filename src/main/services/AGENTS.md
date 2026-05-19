<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-19 | Updated: 2026-05-19 -->

# services

## Purpose
Main-process service layer. Encapsulates persistence, search, permissions, paste automation, autostart, update checking, and the bridge to the Swift native helper. IPC handlers in `src/main/ipc/*` call into these services rather than implementing logic inline.

## Key Files

| File | Description |
|------|-------------|
| `app-services.ts` | `createAppServices` factory — wires every service with the resolved `userData` path and exposes the `AppServices` type. |
| `snippet-repository.ts` | `JsonSnippetRepository` — file-backed CRUD, import/export, and `markInserted` for snippet records. |
| `settings-store.ts` | `JsonSettingsStore` — file-backed user settings persistence, validated by `settingsSchema`. |
| `search-service.ts` | `SnippetSearchService` — ranking and filtering for the palette and library. |
| `paste-service.ts` | `PasteService` — clipboard save/restore and helper-driven Cmd+V simulation with a configurable restore delay. |
| `permissions-service.ts` | `PermissionsService` — Accessibility-trust checks and prompts via the helper binary. |
| `native-helper-service.ts` | Locates and runs the `dist-native/quickcommand-helper` binary; resolves stdout/stderr into typed responses. |
| `autostart-service.ts` | macOS login-item toggle (open at login). |
| `update-service.ts` | `AppUpdateService` — checks for newer GitHub releases and exposes `AppUpdateInfo`. |
| `diagnostic-logger.ts` | `DiagnosticLogger` — persistent diagnostics file used by the preload error reporter and main-process logging. |

## For AI Agents

### Working In This Directory
- Add new services through `app-services.ts` — keep the `createAppServices` factory the single assembly point so IPC handlers receive a complete bundle.
- File-backed stores must use the path under `userDataPath/data/` and tolerate first-run absence (the existing stores create the file on demand).
- Native-dependent behavior (paste, accessibility, settings deep links) flows through `native-helper-service.ts`. Do not shell out to `swiftc` or AppleScript from elsewhere.
- The Accessibility check considers both the Electron app **and** the helper binary — preserve that double-check when modifying `permissions-service.ts`.
- Use `DiagnosticLogger` for anything that should survive across runs; reach for `console.*` only for ephemeral dev output.

### Testing Requirements
- Service-level coverage lives in `tests/unit/snippet-repository.test.ts`, `tests/unit/settings-store.test.ts`, `tests/unit/search-service.test.ts`, `tests/unit/diagnostic-logger.test.ts`, and `tests/unit/update-service.test.ts`.
- For file-backed stores, tests must use `mkdtemp` (see `tests/unit/settings-store.test.ts`); never write into project fixtures.
- Cross-process behavior pairs with integration tests under `tests/integration/`.

### Common Patterns
- Services are plain classes constructed with their dependencies; no global singletons.
- Public methods are async and return plain objects validated against `src/shared/*` schemas where they cross the IPC boundary.

## Dependencies

### Internal
- `src/shared/snippet-model.ts`, `src/shared/settings-model.ts`, `src/shared/update-model.ts`
- `dist-native/quickcommand-helper` — binary built from `native/quickcommand-helper`

### External
- `electron` — `app`, `clipboard`, `globalShortcut` (consumers; not all services use it directly)
- `node:fs/promises`, `node:path`, `node:child_process`

<!-- MANUAL: -->
