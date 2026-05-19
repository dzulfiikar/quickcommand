<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-19 | Updated: 2026-05-19 -->

# native

## Purpose
Container directory for the macOS Swift helper that backs Accessibility, paste, and caret-movement features in the Electron app.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `quickcommand-helper/` | Swift Package source for the helper binary; built into `dist-native/quickcommand-helper` (see `quickcommand-helper/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Anything under `native/` requires Xcode Command Line Tools and `swiftc` to build. Keep changes confined to the helper unless you're adding a brand-new native module.
- The helper is consumed by `src/main/services/native-helper-service.ts`. CLI command names and stdout semantics are a contract — read `quickcommand-helper/AGENTS.md` before changing them.
- After any helper change, run `bun run build:helper`. Packaging via `bun run build` and `bun run package:dir` depends on `dist-native/quickcommand-helper` existing before Electron Builder runs.

## Dependencies

### Internal
- `src/main/services/native-helper-service.ts` — TypeScript consumer
- `scripts/build-helper.ts` — build entry

<!-- MANUAL: -->
