import { app, ipcMain } from "electron";

import { channels } from "./channels";

type AppCallbacks = {
  hidePalette(): void;
  showLibrary(): void;
  showOnboarding(): void;
};

export function registerAutomationHandlers(callbacks: AppCallbacks): void {
  ipcMain.handle(channels.appHidePalette, async () => callbacks.hidePalette());
  ipcMain.handle(channels.appQuit, async () => app.quit());
  ipcMain.handle(channels.appShowLibrary, async () => callbacks.showLibrary());
  ipcMain.handle(channels.appShowOnboarding, async () =>
    callbacks.showOnboarding(),
  );
}
