import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import {
  defaultSettings,
  type Settings,
  settingsSchema,
} from "../../shared/settings-model";

export class JsonSettingsStore {
  constructor(private readonly filePath: string) {}

  async get(): Promise<Settings> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return settingsSchema.parse({
        ...defaultSettings,
        ...parsed,
      });
    } catch (error) {
      if (isMissingFileError(error)) {
        return settingsSchema.parse(defaultSettings);
      }

      throw error;
    }
  }

  async update(patch: Partial<Settings>): Promise<Settings> {
    const current = await this.get();
    const next = settingsSchema.parse({
      ...current,
      ...patch,
    });

    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(next, null, 2), "utf8");
    return next;
  }
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
