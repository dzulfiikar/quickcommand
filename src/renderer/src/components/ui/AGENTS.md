<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-19 | Updated: 2026-05-19 -->

# ui

## Purpose
shadcn/ui primitives configured for QuickCommand. Each file exports a low-level building block (Button, Input, Switch, etc.) with this project's variants, tokens, and accessibility wiring.

## Key Files

| File | Description |
|------|-------------|
| `button.tsx` | `Button` + `buttonVariants` (cva) with `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` variants and several size tokens incl. icon sizes. |
| `input.tsx` | Styled `<input>` with focus ring and invalid states. |
| `textarea.tsx` | Styled `<textarea>` matching the input look. |
| `label.tsx` | Form label primitive. |
| `badge.tsx` | Badge primitive used by the library status pills. |
| `switch.tsx` | Toggle switch (Radix-backed). |
| `separator.tsx` | Horizontal/vertical separator. |
| `scroll-area.tsx` | Custom scroll container with styled track/thumb. |

## For AI Agents

### Working In This Directory
- This directory is configured by `components.json` (style `new-york`, base color `neutral`, alias `@/components/ui`). Keep new primitives consistent with the shadcn/ui generator output for that config.
- Variants are defined with `class-variance-authority`. Add or change variants there rather than introducing one-off classNames at call sites.
- Every primitive must:
  - Forward `className` (merged via `cn()` from `@/lib/utils`).
  - Spread props onto the root element (`...props`).
  - Set a `data-slot="<name>"` attribute for downstream styling hooks (see `button.tsx`).
  - Support `asChild` via `radix-ui` `Slot` when composition is useful.
- Sizing tokens already standardize tap targets (e.g., button `h-11`); preserve those minimums — they are pinned by `tests/unit/button-targets.test.ts`.
- Use Lucide icons (`lucide-react`) consistent with `components.json` `iconLibrary`.

### Testing Requirements
- Primitives that affect tap targets, focus rings, or invariants are covered indirectly by `tests/unit/button-targets.test.ts`, `tests/unit/library-screen-a11y.test.ts`, and `tests/unit/search-bar-a11y.test.tsx`.

### Common Patterns
- Export both the component and its `cva` variants object so consumers can compose styles (`Button` + `buttonVariants`).
- Keep primitives presentational — no IPC, no app state. Higher-level components in `../` own behavior.

## Dependencies

### Internal
- `@/lib/utils` — `cn`

### External
- `class-variance-authority` — variant systems
- `radix-ui` — `Slot` and primitives
- `lucide-react` — icons
- `tailwindcss` — utility classes

<!-- MANUAL: -->
