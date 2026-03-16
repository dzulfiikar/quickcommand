# Tests

## Package Identity

- `tests/` contains Bun-based unit and integration coverage for shared models, main-process services, preload packaging, and cross-process flows.
- Unit tests live in `tests/unit/`. Service and contract-level integration coverage lives in `tests/integration/`.

## Setup And Run

- Run all tests: `bun test`
- Run unit tests: `bun test tests/unit`
- Run integration tests: `bun test tests/integration`
- Run a focused service test: `bun test tests/unit/search-service.test.ts`
- Run a focused integration test: `bun test tests/integration/paste-flow.test.ts`

## Patterns And Conventions

- Use `bun:test` APIs consistently.
- Keep pure logic and storage behavior in `tests/unit/*`, as in `tests/unit/settings-store.test.ts` and `tests/unit/snippet-model.test.ts`.
- Keep service interaction and contract regressions in `tests/integration/*`, as in `tests/integration/snippet-ipc.test.ts` and `tests/integration/paste-flow.test.ts`.
- Import production modules directly from the repo, following the existing relative import style from test files.
- For file-backed stores, use temporary directories and disposable files instead of mutating project fixtures.
- When changing preload, packaging, or window-loader behavior, keep a regression test similar to `tests/unit/preload-config.test.ts`.
- For new cross-process behavior, cover at least one success path and one failure path.

## Key Files

- `tests/unit/preload-config.test.ts`
- `tests/unit/search-service.test.ts`
- `tests/unit/settings-store.test.ts`
- `tests/integration/paste-flow.test.ts`
- `tests/integration/snippet-ipc.test.ts`

## JIT Index Hints

- Find all test cases: `rg -n "describe\\(|it\\(|test\\(" tests`
- Find temp-directory patterns: `rg -n "mkdtemp|tmpdir" tests`
- Find helper, clipboard, or accessibility coverage: `rg -n "clipboard|helper|accessibility" tests`

## Common Gotchas

- Integration tests here are lightweight contract tests, not full Electron UI launches.
- If you add a new renderer-visible API method, make sure there is coverage somewhere between shared types, main services, and integration tests.

## Pre-PR Checks

- `bun test && bun run typecheck`
