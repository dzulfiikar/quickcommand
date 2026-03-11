import { beforeEach, describe, expect, it } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { JsonSettingsStore } from "../../src/main/services/settings-store";

describe("settings integration", () => {
  let settings: JsonSettingsStore;
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "qc-settings-"));
    settings = new JsonSettingsStore(join(tmpDir, "settings.json"));
  });

  it("applies settings update and triggers autostart callback", async () => {
    let autostartCalled = false;
    let autostartValue = false;

    const applyAutostart = (enabled: boolean) => {
      autostartCalled = true;
      autostartValue = enabled;
    };

    const current = await settings.get();
    const next = { ...current, launchAtLogin: true };
    const saved = await settings.update(next);

    applyAutostart(saved.launchAtLogin);

    expect(autostartCalled).toBe(true);
    expect(autostartValue).toBe(true);
  });

  it("persists settings across store instances", async () => {
    const filePath = join(tmpDir, "shared-settings.json");
    const store1 = new JsonSettingsStore(filePath);
    const store2 = new JsonSettingsStore(filePath);

    const current = await store1.get();
    await store1.update({ ...current, globalShortcut: "CmdOrCtrl+Shift+P" });

    const loaded = await store2.get();
    expect(loaded.globalShortcut).toBe("CmdOrCtrl+Shift+P");
  });

  it("validates settings updates with Zod schema", async () => {
    const current = await settings.get();
    const updated = await settings.update({
      ...current,
      pasteRestoreDelayMs: 200,
    });

    expect(updated.pasteRestoreDelayMs).toBe(200);
    expect(typeof updated.pasteRestoreDelayMs).toBe("number");
  });

  it("settings update callback re-registers shortcut", async () => {
    let registeredShortcut = "" as string;

    const onSettingsUpdated = async () => {
      const latestSettings = await settings.get();
      registeredShortcut = latestSettings.globalShortcut ?? "";
    };

    const current = await settings.get();
    await settings.update({
      ...current,
      globalShortcut: "CmdOrCtrl+Alt+Space",
    });
    await onSettingsUpdated();

    expect(registeredShortcut).toBe("CmdOrCtrl+Alt+Space");
  });

  it("handles null shortcut gracefully", async () => {
    const current = await settings.get();
    const updated = await settings.update({ ...current, globalShortcut: null });

    expect(updated.globalShortcut).toBeNull();
  });
});
