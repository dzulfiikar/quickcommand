import { BrowserWindow } from "electron";

import { getPreloadPath } from "./shared";

export function createOnboardingWindow(): BrowserWindow {
  return new BrowserWindow({
    width: 720,
    height: 560,
    show: false,
    resizable: false,
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
