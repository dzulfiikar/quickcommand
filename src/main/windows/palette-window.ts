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
    webPreferences: {
      preload: getPreloadPath(import.meta.url),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
}
