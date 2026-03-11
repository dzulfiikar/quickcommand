import { BrowserWindow } from "electron";

import { getPreloadPath } from "./shared";

export function createLibraryWindow(): BrowserWindow {
  return new BrowserWindow({
    width: 1080,
    height: 760,
    show: false,
    backgroundColor: "#0C0E14",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: getPreloadPath(import.meta.url),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
}
