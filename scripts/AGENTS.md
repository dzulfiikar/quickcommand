<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-19 | Updated: 2026-05-19 -->

# scripts

## Purpose
Repository scripts run by Bun. Currently limited to the Swift helper build pipeline.

## Key Files

| File | Description |
|------|-------------|
| `build-helper.ts` | Compiles `native/quickcommand-helper/Sources/QuickCommandHelper/main.swift` to `dist-native/quickcommand-helper` via `swiftc` (`-O`, frameworks `AppKit`, `ApplicationServices`). Skips rebuild when the binary is newer than the source unless `--force` is passed. |

## For AI Agents

### Working In This Directory
- Scripts are invoked through `package.json` (`bun run build:helper`, `bun run build`, `bun run package:dir`). Add a matching `scripts` entry whenever you add a script here.
- `build-helper.ts` writes to `dist-native/`. Electron Builder (via `bun run package:dir` / `bun run build`) expects that path to exist before packaging.
- Keep build scripts idempotent and side-effect-aware (the existing helper script checks mtimes; preserve that pattern for slow steps).
- Use `Bun.spawnSync` with explicit `cwd`, `stdout`, and `stderr` so failures surface their compiler output.
- Failures should `throw` (or `process.exit(1)` after printing) — the package script chain depends on non-zero exit on failure.

### Testing Requirements
- Build behavior is exercised manually via `bun run build:helper` and end-to-end via `bun run package:dir`. There is no dedicated unit coverage for scripts.

### Common Patterns
- Resolve paths from `process.cwd()` and assume scripts run from the repo root.
- Print a one-line success message (`Built helper at <path>`) so CI logs are readable.

## Dependencies

### External
- `bun` runtime — `Bun.spawnSync`, top-level await
- `swiftc` (Xcode Command Line Tools) — required at build time for the helper

<!-- MANUAL: -->
