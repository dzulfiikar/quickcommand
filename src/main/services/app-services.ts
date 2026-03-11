import { join } from "node:path";
import { AutostartService } from "./autostart-service";
import { PasteService } from "./paste-service";
import { PermissionsService } from "./permissions-service";
import { SnippetSearchService } from "./search-service";
import { JsonSettingsStore } from "./settings-store";
import { JsonSnippetRepository } from "./snippet-repository";

export function createAppServices(userDataPath: string) {
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
  };
}

export type AppServices = ReturnType<typeof createAppServices>;
