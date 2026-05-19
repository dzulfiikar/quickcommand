<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-19 | Updated: 2026-05-19 -->

# shared

## Purpose
Cross-process TypeScript contracts and Zod-backed data models. Imported by both the main process and renderer so payloads stay structurally identical across IPC boundaries.

## Key Files

| File | Description |
|------|-------------|
| `app-api.ts` | `QuickCommandAPI` interface, `WindowKind` union, and `InsertResult` type — the contract shared by preload and renderer. |
| `app-meta.ts` | App-level metadata constants used by both processes. |
| `cursor-placeholder.ts` | Placeholder token logic for cursor-aware snippet insertion (covered by `tests/unit/cursor-placeholder.test.ts`). |
| `settings-model.ts` | Zod schema and `Settings` type for persisted user settings. |
| `snippet-model.ts` | Zod schemas: `snippetInputSchema`, `snippetRecordSchema`, `snippetFileSchema`, `exportBundleSchema`. |
| `update-model.ts` | `AppUpdateInfo` type used by the update service and renderer. |

## For AI Agents

### Working In This Directory
- Schemas defined here are the **single source of truth**. The main process parses with these schemas at IPC boundaries; the renderer uses the inferred types only.
- A change to a schema is a contract change — also touch `src/main/ipc/*.ts`, `src/main/services/*.ts`, `src/preload/index.ts`, and any renderer code that reads the same shape.
- Keep the export bundle schema (`exportBundleSchema`) backwards compatible. The literal `version: 1` indicates a versioned import format; if you must break it, introduce a new version rather than mutating the existing one.
- Prefer `z.iso.datetime({ offset: true })` for timestamps to match the existing `isoDateTime` pattern in `snippet-model.ts`.

### Testing Requirements
- Pure schema and helper logic is unit-tested in `tests/unit/snippet-model.test.ts`, `tests/unit/cursor-placeholder.test.ts`, and `tests/unit/settings-store.test.ts` (which exercises `settings-model.ts` indirectly).

### Common Patterns
- Export both the Zod schema and the inferred `z.infer<...>` type alongside it.
- Avoid runtime side effects — files in this directory should be pure type/schema modules.

## Dependencies

### External
- `zod` — schema validation

<!-- MANUAL: -->
