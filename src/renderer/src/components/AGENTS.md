<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-19 | Updated: 2026-05-19 -->

# components

## Purpose
Reusable, screen-agnostic React components — panels, lists, and forms used by more than one feature screen. Lower-level shadcn/ui primitives live in `ui/`.

## Key Files

| File | Description |
|------|-------------|
| `SnippetForm.tsx` | Create/edit form for a snippet draft; consumes `SnippetInput` and reports submit/cancel back through props. |
| `SearchBar.tsx` | Accessible search input used by the library and palette; covered by `tests/unit/search-bar-a11y.test.tsx`. |
| `SettingsPanel.tsx` | Settings UI surface with hotkey, accessibility, autostart, and update controls; covered by `tests/unit/settings-panel.test.tsx`. |
| `AboutPanel.tsx` | About/diagnostics panel with version, build info, update CTA; covered by `tests/unit/about-panel.test.tsx`. |
| `ParamInputForm.tsx` | Inline form for filling cursor-aware snippet parameters before paste. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `ui/` | shadcn/ui primitives (Button, Input, Badge, etc.) configured for this project (see `ui/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Components here must remain **screen-agnostic**: take data and callbacks via props, never read `window.quickCommand` directly. The owning screen (in `features/`) does the IPC.
- Forms validate on submit using the relevant Zod schema from `src/shared`; surface errors via the existing `friendlyError` flow in `App.tsx`.
- For accessibility, mirror the patterns already in `SearchBar.tsx` (proper `role`, `aria-*`, focus management). The a11y unit tests pin those expectations.
- Composition over branching: when a component starts juggling multiple modes, split it.
- Use `Button`, `Input`, `Badge`, `Switch`, `Textarea`, etc. from `ui/` rather than introducing parallel primitives.

### Testing Requirements
- Component tests use `bun:test` + JSX; see `tests/unit/snippet-form.test.tsx`, `tests/unit/settings-panel.test.tsx`, `tests/unit/search-bar-a11y.test.tsx`, and `tests/unit/about-panel.test.tsx` as references.
- New a11y-sensitive components should land with at least one a11y-focused test.

### Common Patterns
- Variant styling is driven by `class-variance-authority` (`cva`) inside `ui/` primitives; in higher-level components, prefer plain Tailwind classes via `cn()`.
- Status badges go through `getLibraryShortcutBadge` / `getLibraryAccessibilityBadge` in `@/lib/library-header-badges` — don't duplicate badge styling inline.

## Dependencies

### Internal
- `@/components/ui/*` — primitives
- `@/lib/utils` — `cn`
- `@/lib/motion` — Framer Motion presets
- `src/shared/*` — input/record schemas and types

### External
- `react`, `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`

<!-- MANUAL: -->
