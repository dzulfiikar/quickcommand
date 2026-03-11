import { ipcMain } from "electron";
import { settingsSchema } from "../../shared/settings-model";
import type { AppServices } from "../services/app-services";
import { channels } from "./channels";

type SettingsCallbacks = {
  onSettingsUpdated(): Promise<void> | void;
};

export function registerSettingsHandlers(
  services: AppServices,
  callbacks: SettingsCallbacks,
): void {
  ipcMain.handle(channels.settingsGet, async () => services.settings.get());

  ipcMain.handle(channels.settingsUpdate, async (_event, patch) => {
    const current = await services.settings.get();
    const next = settingsSchema.parse({
      ...current,
      ...patch,
    });

    const saved = await services.settings.update(next);
    services.autostart.apply(saved.launchAtLogin);
    await callbacks.onSettingsUpdated();
    return saved;
  });

  ipcMain.handle(channels.settingsCheckAccessibility, async () =>
    services.permissions.isAccessibilityTrusted(),
  );

  ipcMain.handle(channels.settingsOpenAccessibility, async () =>
    services.permissions.openAccessibilitySettings(),
  );
}
