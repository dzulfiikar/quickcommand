# Native Helper

## Directory Identity

- `native/quickcommand-helper/` contains the macOS Swift helper binary used for Accessibility checks, settings deep links, paste simulation, and cursor movement.
- The built executable is consumed by the Electron main process through `src/main/services/native-helper-service.ts`.

## Key Files

- `native/quickcommand-helper/Sources/QuickCommandHelper/main.swift`: command-line entrypoint and helper command implementations.
- `scripts/build-helper.ts`: Bun script that compiles the Swift source into `dist-native/quickcommand-helper`.
- `src/main/services/native-helper-service.ts`: helper process launcher and path resolution.

## Patterns And Conventions

- Keep the helper CLI contract stable. Current commands are:
  - `check-accessibility`
  - `prompt-accessibility`
  - `open-accessibility-settings`
  - `paste`
  - `move-left`
- Success output is parsed as plain stdout strings by the TypeScript services. stderr content is treated as failure.
- Keep macOS-only APIs and event synthesis in Swift instead of trying to reproduce them in TypeScript.
- If you add or rename helper commands, update the TypeScript helper service and the affected permissions/paste flows in the same change.
- Accessibility behavior must consider both the Electron app and the helper binary; the main process currently checks both.

## Commands

- Rebuild helper: `bun run build:helper`
- Rebuild helper without cache skip logic: `bun run build:helper -- --force`
- Validate full packaging flow after helper changes: `bun run package:dir`

## Gotchas

- The helper build expects Xcode Command Line Tools and `swiftc` to be available.
- Packaging depends on `dist-native/quickcommand-helper` being present before Electron Builder runs.
