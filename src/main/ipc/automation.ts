import { app, ipcMain } from "electron";

import type { AppUpdateInfo } from "../../shared/update-model";
import { channels } from "./channels";

type AppCallbacks = {
  checkForUpdates(): Promise<AppUpdateInfo>;
  hidePalette(): void;
  openUpdateDownload(url: string): Promise<void> | void;
  showLibrary(): void;
  showOnboarding(): void;
};

export function registerAutomationHandlers(callbacks: AppCallbacks): void {
  ipcMain.handle(channels.appCheckForUpdates, async () =>
    callbacks.checkForUpdates(),
  );
  ipcMain.handle(channels.appHidePalette, async () => callbacks.hidePalette());
  ipcMain.handle(channels.appOpenUpdateDownload, async (_event, url) =>
    callbacks.openUpdateDownload(String(url)),
  );
  ipcMain.handle(channels.appQuit, async () => app.quit());
  ipcMain.handle(channels.appShowLibrary, async () => callbacks.showLibrary());
  ipcMain.handle(channels.appShowOnboarding, async () =>
    callbacks.showOnboarding(),
  );
}
