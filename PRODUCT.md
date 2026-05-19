# Product

## Register

product

## Users

QuickCommand is for people whose work is full of repeated text: developers who rerun Git, Bun, Docker, and Kubernetes commands; on-call operators paging through runbooks and status copy; support, sales, and ops teams who reuse replies and structured templates. They sit in front of a Mac all day with several apps open and one keyboard. Their primary need isn't *finding* the right snippet from cold memory, it's recalling something they know exists, jumping to it in under a second, and pasting it into the app they're already in without breaking flow.

The audience is genuinely heterogeneous. None of the three groups is "primary" at the cost of the others; the design has to read as professional and dependable to all of them. The shared trait is keyboard-first, low-tolerance-for-friction users who would rather type a global shortcut than click a tray icon. macOS-only, Apple Silicon, single-machine, local-first. Snippets are sometimes ephemeral (a one-off Git rebase invocation), sometimes durable (a release-notes template they reuse weekly).

## Product Purpose

QuickCommand replaces the tax of retyping repeatable text. Save once, summon with a global shortcut or menu-bar click, fuzzy-search by ranked relevance, paste into the foreground app via clipboard-and-Cmd+V. The library window owns full editing; the palette owns lookup-and-paste; the tray owns the casual one-handed glance. Snippets and settings live as JSON on the user's machine, with import/export for portability. No accounts, no sync, no cloud.

Success is invisibility. The app shows up exactly when summoned, does the one thing the user came for, and disappears. A second-class outcome is also acceptable: the user opens the library, edits a snippet, and leaves with confidence the change is saved locally. Failure looks like the user remembering the snippet exists but not finding it fast enough, the paste landing in the wrong window, or the app drawing attention to itself when it should have stepped aside.

## Brand Personality

Pro-grade, dense, technical. The voice is closer to Linear and Raycast than to Notion or Slack: confident, terse, no flourishes that ask for credit. Surfaces are information-rich without feeling cramped; lists prefer clarity over decoration; copy treats the user as a peer who already knows what a global hotkey is. The app should feel like a tool a developer would build for themselves, not a product designed by committee.

Tone in copy: direct, present-tense, no exclamation marks, no emoji. Errors are specific about cause and recoverable action, not apologetic. Confirmations are small and verbal-shrug-sized: "Saved", "Copied", "Imported 14 snippets". Empty states explain the next single action, not the philosophy of the feature.

## Anti-references

This app should explicitly NOT look or feel like:

- **Generic SaaS dashboards.** No card grids of identical-shaped tiles, no big-number-with-supporting-stats hero metrics, no marketing-style gradient accents on tool surfaces, no navy-and-aqua palette tropes, no mascots.
- **Heavy glass and blur effects.** macOS Sequoia-era over-frosted vibrancy, decorative `backdrop-filter` on every panel, glass cards stacked on glass. Vibrancy is acceptable only where the OS already provides it (e.g. unmodified menu-bar popover chrome); never as decoration.
- **Cloud-app maximalism.** Sidebars full of teamspaces, share buttons, presence avatars, sync-status indicators, comment threads, "@-mention" chrome. QuickCommand is local-first; the UI should not pretend otherwise.
- **Toy or playful illustrations.** No mascots, no doodled empty states, no oversized emoji as decoration, no big confetti moments. Icons stay functional and small.

Reference points in the *right* direction (positive references, not anti-references): Raycast for keyboard-first feel; Linear for typographic restraint and dense lists; Things 3 for considered micro-copy and rhythm; the macOS Spotlight surface for the "appears, does the job, disappears" choreography.

## Design Principles

- **Disappear when not needed.** The palette opens, accepts a search, pastes, and is gone. Every surface treats user attention as a borrowed resource. If a panel can shrink, hide, or auto-dismiss without harm, it does.
- **Keyboard before mouse.** Every primary action is reachable from the keyboard with a discoverable shortcut and a visible focus state. Mouse is welcome but never required, and never the only path through a flow.
- **Density without noise.** Lists are tight, but every row earns its information. Avoid decorative borders, avoid icons that repeat the label, avoid badges that don't change behavior. When density grows, raise type clarity, not chrome.
- **Local-first, visibly so.** No spinners that look like network calls, no "syncing" affordances, no chrome borrowed from cloud apps. The UI should make the user feel they own their data, on their machine, today.
- **Practice what you preach.** A tool for fast text reuse must itself be fast: sub-100ms perceived latency on palette open, search, and paste. Visible jank or wait states inside QuickCommand contradict the product's premise and are bugs, not styling.

## Accessibility & Inclusion

Target WCAG 2.2 AA across all four surfaces (palette, library, onboarding, tray) with a deliberate emphasis on keyboard accessibility:

- Every interactive element has a clear, persistent focus indicator that survives the dark surface treatment.
- All flows are completable with the keyboard alone, including snippet creation/editing, search, paste insertion, settings, import/export, and onboarding.
- Tab order matches visual order; no focus traps outside intentional modal-like flows (the palette itself, the onboarding gate).
- Respect `prefers-reduced-motion`. Motion presets in `@/lib/motion` should already collapse to instant transitions when the OS asks; don't add bespoke animations that ignore the setting.
- Color is never the sole carrier of state. Status pills (`status-pill--success`, `status-pill--warning`) pair color with a label, never a hue alone.
- Maintain at least 4.5:1 contrast for body text and 3:1 for large text and meaningful UI affordances against the dark library/palette surfaces and the tray popover.
- Hit targets follow the existing 44pt minimum encoded by `Button` size tokens (`h-11`); don't regress those for visual density.
