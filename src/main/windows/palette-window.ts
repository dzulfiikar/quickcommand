import { BrowserWindow } from "electron";

import { getPreloadPath } from "./shared";

export function createPaletteWindow(): BrowserWindow {
  return new BrowserWindow({
    width: 760,
    height: 500,
    show: false,
    frame: false,
    transparent: true,
    resizable: true,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    vibrancy: "under-window",
    titleBarStyle: "hiddenInset",
    // The dock is hidden, so QuickCommand is an accessory app and a normal
    // window cannot reliably become the key window — it blurs and hides before
    // the user can pick a snippet. A panel window can become key without
    // activating the app (the Spotlight/Raycast pattern), so it holds focus
    // and keyboard input until the user dismisses it or pastes.
    type: "panel",
    webPreferences: {
      preload: getPreloadPath(import.meta.url),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
}
