# QuickCommand

## Project Snapshot

- Single-app repository for a planned macOS utility named `QuickCommand`.
- Intended stack: `Electron + TypeScript + React + Bun`, with macOS-specific native automation for paste insertion.
- Current repo state is documentation-first. The main source of truth is the product plan in `docs/plans/`.
- Root guidance lives here. Keep this file lightweight and update it as the project structure grows.

## Agent Workflow

- Use relevant local skills whenever they apply instead of improvising workflow.
- Default process expectations:
  - Use `brainstorming` before feature expansion or notable UX changes.
  - Use `test-driven-development` before implementing features or fixes.
  - Use `systematic-debugging` before fixing bugs or unexpected behavior.
  - Use `verification-before-completion` before claiming work is complete.
  - Use `requesting-code-review` before merge or final handoff.
- Use `writing-plans` when converting a product plan into an implementation task list.

## Documentation Sources

- Use MCP Context7 as the primary source for package and library documentation.
- Required flow for third-party library docs:
  - Run `resolve-library-id`.
  - Run `get-library-docs`.
- Fall back to official vendor docs or targeted web search only when Context7 is missing the package or the needed topic.
- Prefer official documentation and primary sources over blog posts, tutorials, or summaries.

## Plan Maintenance

- Active plans live in `docs/plans/`.
- Every plan must include these metadata fields near the top:
  - `Created`
  - `Last Updated`
  - `Plan State`
  - `Allowed States`
  - `Scope`
- Allowed plan states:
  - `TODO`: planned and approved enough to track, not started
  - `IMPLEMENTING`: actively being worked on
  - `FINISHED`: implemented and verified for the scoped outcome
- When working against a plan, update the plan document immediately when its state changes.
- On every state change:
  - update `Last Updated`
  - append a row to the `History` table
- Do not mark a plan `FINISHED` until verification has actually been run and passed for the scoped work.

## Current Source of Truth

- Product plan: `docs/plans/2026-03-11-quickcommand-product-plan.md`

## Repository Layout

- `.github/`: editor and assistant-related repo instructions
- `docs/plans/`: dated planning artifacts and implementation history

## Quick Commands

- List files: `rg --files`
- Find plans: `rg -n "^> Plan State:|^## History" docs/plans`
- Find Electron docs references: `rg -n "Electron|Bun|Context7" docs`
- Check repo status: `git status --short`

## Definition of Done

- Relevant plan state is updated correctly.
- `Last Updated` and `History` are consistent with the latest change.
- Any changed docs remain accurate to the current repository state.
