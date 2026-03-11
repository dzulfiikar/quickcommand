import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { type BrowserWindow, screen } from "electron";

import type { WindowKind } from "../../shared/app-api";

export async function loadWindow(
  window: BrowserWindow,
  kind: WindowKind,
): Promise<void> {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const devUrl = process.env.ELECTRON_RENDERER_URL;

  if (devUrl) {
    const url = new URL(devUrl);
    url.hash = kind;
    await window.loadURL(url.toString());
    return;
  }

  await window.loadFile(join(currentDir, "../renderer/index.html"), {
    hash: kind,
  });
}

export function centerWindowOnActiveDisplay(window: BrowserWindow): void {
  const cursorPoint = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursorPoint);
  const { width, height } = window.getBounds();
  const x = Math.round(
    display.workArea.x + (display.workArea.width - width) / 2,
  );
  const y = Math.round(
    display.workArea.y + (display.workArea.height - height) / 3,
  );

  window.setPosition(x, y);
}
