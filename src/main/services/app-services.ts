import { join } from "node:path";
import { AutostartService } from "./autostart-service";
import { PasteService } from "./paste-service";
import { PermissionsService } from "./permissions-service";
import { SnippetSearchService } from "./search-service";
import { JsonSettingsStore } from "./settings-store";
import { JsonSnippetRepository } from "./snippet-repository";
import { AppUpdateService } from "./update-service";

export function createAppServices(
  userDataPath: string,
  options: {
    appVersion: string;
    openExternal(url: string): Promise<void> | void;
  },
) {
  return {
    autostart: new AutostartService(),
    paste: new PasteService(),
    permissions: new PermissionsService(),
    search: new SnippetSearchService(),
    settings: new JsonSettingsStore(
      join(userDataPath, "data", "settings.json"),
    ),
    snippets: new JsonSnippetRepository(
      join(userDataPath, "data", "snippets.json"),
    ),
    updates: new AppUpdateService({
      currentVersion: options.appVersion,
      openExternal: options.openExternal,
    }),
  };
}

export type AppServices = ReturnType<typeof createAppServices>;
