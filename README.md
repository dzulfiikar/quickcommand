<div align="center">

# QuickCommand

**Your commands, prompts, and snippets — one keystroke away.**

A keyboard-first macOS menu bar app for everyone who retypes the same commands, replies, and templates all day. Save once, summon instantly with a global shortcut, and paste straight into the app you're already in.

[Features](#features) · [Screenshots](#screenshots) · [Install](#install) · [Usage](#usage) · [Development](#development) · [License](#license)

`Electron 41` · `React 19` · `TypeScript` · `Bun` · `Swift helper` · macOS (Apple Silicon)

</div>

---

## Why QuickCommand

You already know the command. You just don't want to type `kubectl logs deployment/api-gateway --tail=250 --follow` for the hundredth time — or hunt through a notes app for that release checklist, that support reply, that prompt.

QuickCommand keeps all of it a single shortcut away and pastes it **into whatever app has focus** — Terminal, your editor, a browser textarea, Slack. No copy-paste shuffle, no context switch.

- **Stop retyping repeatable work** — shell commands, release notes, support replies, prompts, and templates stay one shortcut away.
- **Paste into real apps, not just into QuickCommand** — the app hides, writes to the clipboard, fires `Cmd+V`, then restores your previous clipboard contents.
- **Search that feels instant** — fuzzy matching ranked by relevance, recency, and how often you use each snippet, so your most-used items rise to the top.
- **Stay in your flow** — the global palette for fast lookup, the menu bar popover for quick access, the library window for full editing control.
- **Everything stays on your Mac** — snippets and settings are plain local JSON with import/export. No cloud, no account, no telemetry.

---

## Features

### Three surfaces, one library

- **🎯 Global command palette** — a centered, keyboard-first overlay. Hit your shortcut anywhere, type, press `Enter` to paste the top result, `Esc` to dismiss. Arrow keys to navigate.
- **📋 Menu bar popover** — a compact, fully keyboard-navigable menu bar view for quick access, recents, and common actions without opening the full window.
- **🗂️ Snippet library** — the full management window: create, edit, delete, search, import, and export your collection.

### Snippets that do more

- **🔡 Parameterized snippets** — drop placeholders like `{{name}}` or `{{env}}` into a snippet, then fill them in at paste time. Build a template once, reuse it everywhere.
- **📈 Usage-aware ranking** — QuickCommand tracks use count and last-used time (internally, never shown as editable fields) to surface what you actually reach for.
- **🔁 Import / export** — versioned JSON bundles, so you can back up, move between machines, or share a starter set.

### Built to feel native

- **🎨 Six color palettes × light / dark / system** — Sand, Nord, Dracula, Tokyo Night, Gruvbox, and Solarized, each calibrated for both light and dark mode and audited for WCAG AA contrast.
- **⌨️ Keyboard-first everywhere** — every surface is navigable without touching the mouse.
- **🧭 Guided onboarding** — first run walks you through Accessibility permission and confirms your global shortcut actually registered.
- **⚙️ Sensible settings** — launch at login, show-window-on-startup, clipboard restore delay, theme, and palette.
- **🔔 In-app update checks** — compares your version against GitHub Releases and opens a manual download flow for unsigned macOS builds.
- **🚫 Menu bar utility** — runs as `LSUIElement`, so there's no Dock icon getting in your way.

---

## Screenshots

### Command Palette

The global overlay — type, navigate with arrows, `Enter` to paste, `Esc` to close.

![QuickCommand command palette](screenshots/command-palette.png)

### Snippet Library

Full CRUD with live search, parameter editing, and usage stats.

![QuickCommand library window](screenshots/library-window.png)

### Menu Bar Popover

Compact quick access with recents, paste buttons, and common actions.

![QuickCommand menubar popover](screenshots/menubar-popover.png)

---

## Best For

- **Developers** who repeat Git, Bun, Docker, Kubernetes, or deployment commands all day.
- **Operators / SREs** who need incident-response snippets and production runbooks within reach.
- **Support, sales, and ops teams** reusing replies and structured text.
- **Prompt engineers** keeping a tuned library of LLM prompts on hand.
- **Anyone** who'd rather have a fast local launcher than a cloud workspace.

---

## Install

> QuickCommand currently ships as an **unsigned** macOS app for Apple Silicon. Builds aren't notarized yet, so macOS Gatekeeper will warn on first launch — see the workaround below.

### Requirements

- macOS on Apple Silicon (M1 or later)
- **Accessibility permission** (QuickCommand prompts for this during onboarding — it's required to simulate paste)

### From a release

1. Download the latest `QuickCommand-<version>-arm64.dmg` from the [Releases](https://github.com/dzulfiikar/quickcommand/releases) page.
2. Open the DMG and drag **QuickCommand** to `/Applications`.
3. On first launch, macOS may block the unsigned app. Either:
   - Right-click the app → **Open** → **Open** again in the dialog, **or**
   - Run `xattr -dr com.apple.quarantine /Applications/QuickCommand.app` in Terminal.
4. Complete onboarding: grant **Accessibility** permission and confirm your global shortcut.

### Build it yourself

See [Development](#development) below — `bun run package:dir` produces a local `.app` bundle.

---

## Usage

1. **Save a snippet** — open the library (menu bar → *Open Library*) and add a title plus the command or text. Add `{{placeholders}}` for anything you fill in at paste time.
2. **Summon the palette** — press the global shortcut (default `⌃⌥Space` / `CommandOrControl+Alt+Space`) from any app.
3. **Search and paste** — type a few characters, press `Enter` on the top result (or arrow to another), and QuickCommand pastes it into the app you were just in.
4. **Tweak the shortcut** — change it anytime from the library's settings panel.

QuickCommand hides its UI first, swaps the clipboard, triggers the paste, then restores your original clipboard contents — so insertion never clobbers what you'd already copied.

---

## Development

### Tech stack

- **Electron 41 + React 19 + TypeScript** — desktop UI
- **Bun** — package management, scripts, and tests
- **electron-vite** — main / preload / renderer builds
- **Tailwind CSS v4 + Radix UI + Framer Motion** — renderer design system
- **Fuse.js** — fuzzy snippet search
- **Zod** — snippet and settings validation
- **Swift helper** — macOS Accessibility checks, settings deep links, and `Cmd+V` paste automation

All OS integration, persistence, search, and paste automation live in the Electron main process. Renderer windows stay sandboxed (`contextIsolation`, `sandbox`, `nodeIntegration: false`, strict local-only CSP).

### Setup

```bash
# Install dependencies
bun install

# Start Electron in development mode (also builds the Swift helper)
bun run dev

# Renderer-only browser preview (mocked Electron API)
bun run dev:browser
```

### Verify

```bash
bun test            # all tests
bun test tests/unit # unit tests only
bun run typecheck   # TypeScript
bun run lint        # Biome
```

### Build & package

```bash
bun run build:helper   # compile the Swift helper
bun run build          # build main / preload / renderer
bun run package:dir    # local unsigned .app bundle
bun run dist           # full DMG + zip artifacts
```

### Browser preview routes

`bun run dev:browser` boots Vite at `http://localhost:5199/` with an in-memory mock preload in place of the Electron API. The renderer picks its surface from the URL hash:

| Window | URL |
|---|---|
| Library (default) | `http://localhost:5199/` or `#library` |
| Palette | `http://localhost:5199/#palette` |
| Onboarding | `http://localhost:5199/#onboarding` |
| Tray popover | `http://localhost:5199/#tray` |

In browser preview, Accessibility, hotkey registration, and `Cmd+V` paste are mocked — UI states render, but no OS-level action runs. Tray and Palette are sized for native popovers, so they look small against a full browser viewport.

### Project layout

```text
src/main/       Electron lifecycle, tray/window management, IPC, native-service orchestration
src/preload/    Secure contextBridge surface (kept in sync with src/shared/app-api.ts)
src/renderer/   React UI, Tailwind styling, browser preview entry
src/shared/     Zod-backed shared models and cross-process contracts
native/         Swift helper source (Accessibility, settings deep links, paste, caret movement)
tests/          Bun unit and integration coverage
docs/plans/     Dated implementation and product plans
```

Each area has its own `AGENTS.md` with closer guidance — read the nearest one before editing files in that directory.

---

## Contributing

- Keep product-facing changes aligned with current macOS app behavior.
- Run `bun test` and `bun run typecheck` before handing off changes.
- Run `bun run build:helper` when touching native paste automation or packaging.
- Update this README and the `screenshots/` folder when UI changes affect what users see.
- Prefer small, focused changes over broad refactors unless the task calls for it.

---

## License

Released under the [GNU General Public License v3.0](LICENSE).

QuickCommand is free software: you can redistribute it and/or modify it under the terms of the GPL — but any distributed derivative must also remain open-source under the same license.

Copyright © 2026 Dzulfikar.
