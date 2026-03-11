# QuickCommand

A macOS menubar snippet launcher built with Electron, TypeScript, React, and Bun. Save terminal commands or text snippets, search instantly with a global shortcut, and paste into any app.

## Features

- **Global shortcut** — open the search palette from anywhere (`⌘⇧Space` by default)
- **Fuzzy search** — find snippets instantly across your entire library
- **Clipboard-based paste** — insert snippets into the focused app via `⌘V` automation
- **Menubar popover** — quick access from the macOS menu bar
- **Full library window** — create, edit, search, import/export snippets
- **Local-only storage** — all data stays on your machine as JSON files
- **macOS native** — Swift helper for Accessibility automation, template tray icon, LSUIElement (no Dock icon)

## Requirements

- macOS (Apple Silicon or Intel)
- [Bun](https://bun.sh/) v1.x
- Xcode Command Line Tools (for Swift helper compilation)
- Accessibility permission (granted at first run)

## Getting Started

```bash
# Install dependencies
bun install

# Start development mode (builds Swift helper + launches app with hot reload)
bun run dev

# Run tests
bun test

# Type check
bun run typecheck
```

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Development mode with hot reload |
| `bun run build` | Build main, preload, and renderer |
| `bun run build:helper` | Compile the Swift native helper |
| `bun test` | Run all tests (unit + integration) |
| `bun run typecheck` | TypeScript type check |
| `bun run lint` | Lint with Biome |
| `bun run format` | Auto-format with Biome |
| `bun run package:dir` | Package to `.app` directory |
| `bun run dist` | Full distribution build (`.app` + `.dmg`) |

## Architecture

```
src/
├── main/           Electron main process
│   ├── ipc/        IPC channel handlers (snippets, settings, automation)
│   ├── services/   Business logic (search, paste, permissions, persistence)
│   └── windows/    Window creation (palette, tray, library, onboarding)
├── preload/        Sandboxed bridge — exposes window.quickCommand API
├── renderer/       React UI
│   └── src/
│       ├── components/   Reusable UI (SearchBar, SnippetList, SnippetForm, SettingsPanel)
│       └── features/     Screen components (Palette, Tray, Library, Onboarding)
└── shared/         Isomorphic types and validation schemas

native/             Swift helper for macOS Accessibility automation
tests/              Bun test suites (unit + integration)
resources/icons/    App icon (.icns) and tray template icons (.png)
```

### How paste works

1. User selects a snippet → renderer sends `snippets:insert` IPC
2. Main process saves current clipboard, writes snippet value to clipboard
3. Swift helper simulates `⌘V` via CGEvent (requires Accessibility permission)
4. Main process restores the original clipboard after a configurable delay

### Key files

| File | Purpose |
|------|---------|
| `src/shared/app-api.ts` | Type contract between Electron and React |
| `src/main/services/snippet-repository.ts` | JSON-based snippet persistence |
| `src/main/services/paste-service.ts` | Clipboard capture → paste → restore pipeline |
| `native/.../main.swift` | Accessibility check, paste simulation, settings opener |

## Tech Stack

- **Runtime**: [Electron](https://www.electronjs.org/) 41 + [Bun](https://bun.sh/)
- **Build**: [electron-vite](https://electron-vite.org/) + [Vite](https://vitejs.dev/)
- **UI**: [React](https://react.dev/) 19
- **Search**: [Fuse.js](https://www.fusejs.io/) (fuzzy matching)
- **Validation**: [Zod](https://zod.dev/) 4
- **Linting**: [Biome](https://biomejs.dev/)
- **Testing**: Bun's built-in test runner
- **Native**: Swift (macOS Accessibility automation)
