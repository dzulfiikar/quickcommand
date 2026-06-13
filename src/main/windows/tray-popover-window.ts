import { BrowserWindow, type Rectangle } from "electron";

import { getPreloadPath } from "./shared";

export function createTrayPopoverWindow(): BrowserWindow {
  return new BrowserWindow({
    width: 420,
    height: 520,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    transparent: true,
    alwaysOnTop: true,
    vibrancy: "menu",
    // Accessory app: a panel window becomes key without activating the app,
    // so the popover holds focus instead of blurring away immediately.
    type: "panel",
    webPreferences: {
      preload: getPreloadPath(import.meta.url),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
}

export function positionTrayPopover(
  window: BrowserWindow,
  trayBounds: Rectangle,
): void {
  const { width, height } = window.getBounds();
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - width / 2);
  const y = Math.round(trayBounds.y + trayBounds.height + 8);
  window.setPosition(x, y, false);
}
