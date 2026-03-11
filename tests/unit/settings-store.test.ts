import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { JsonSettingsStore } from "../../src/main/services/settings-store";

describe("JsonSettingsStore", () => {
  let tempDir: string;
  let store: JsonSettingsStore;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "quickcommand-settings-"));
    store = new JsonSettingsStore(join(tempDir, "settings.json"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  test("returns defaults before any settings file exists", async () => {
    const settings = await store.get();

    expect(settings.firstRunComplete).toBe(false);
    expect(settings.globalShortcut).toBe("CommandOrControl+Alt+Space");
    expect(settings.launchAtLogin).toBe(false);
  });

  test("merges persisted settings updates", async () => {
    const updated = await store.update({
      firstRunComplete: true,
      launchAtLogin: true,
    });

    const reloaded = await store.get();

    expect(updated.firstRunComplete).toBe(true);
    expect(reloaded.launchAtLogin).toBe(true);
  });
});
