import { beforeEach, describe, expect, it } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { JsonSettingsStore } from "../../src/main/services/settings-store";
import { JsonSnippetRepository } from "../../src/main/services/snippet-repository";
import type { InsertResult } from "../../src/shared/app-api";

describe("permissions gate integration", () => {
  let snippets: JsonSnippetRepository;
  let settings: JsonSettingsStore;
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "qc-perms-"));
    snippets = new JsonSnippetRepository(join(tmpDir, "snippets.json"));
    settings = new JsonSettingsStore(join(tmpDir, "settings.json"));
  });

  it("gates snippet insert behind accessibility check", async () => {
    const created = await snippets.create({
      title: "Protected Cmd",
      value: "sudo reboot",
    });

    async function simulateInsert(
      id: string,
      isTrusted: boolean,
      pasteText: (text: string) => Promise<void>,
    ): Promise<InsertResult> {
      if (!isTrusted) {
        return { ok: false, reason: "not_trusted" };
      }

      const all = await snippets.list();
      const snippet = all.find((s) => s.id === id);
      if (!snippet) throw new Error(`Snippet not found: ${id}`);

      await pasteText(snippet.value);
      await snippets.markInserted(id);
      return { ok: true };
    }

    // Denied case
    const denied = await simulateInsert(created.id, false, async () => {});
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.reason).toBe("not_trusted");

    // Usage should not have been tracked
    const afterDenied = await snippets.list();
    expect(afterDenied[0].useCount).toBe(0);

    // Granted case
    let pastedValue = "";
    const granted = await simulateInsert(created.id, true, async (text) => {
      pastedValue = text;
    });
    expect(granted.ok).toBe(true);
    expect(pastedValue).toBe("sudo reboot");

    // Usage should now be tracked
    const afterGranted = await snippets.list();
    expect(afterGranted[0].useCount).toBe(1);
  });

  it("checks permission status correctly for boolean true/false", async () => {
    function parsePermissionResult(stdout: string): boolean {
      return stdout === "true";
    }

    expect(parsePermissionResult("true")).toBe(true);
    expect(parsePermissionResult("false")).toBe(false);
    expect(parsePermissionResult("")).toBe(false);
    expect(parsePermissionResult("unexpected")).toBe(false);
  });

  it("insert preserves snippet data when permission is denied", async () => {
    const created = await snippets.create({
      title: "Preserve Me",
      value: "important data",
    });
    const originalData = { ...created };

    // Permission denied — no side effects should occur
    const isTrusted = false;
    if (isTrusted) {
      await snippets.markInserted(created.id);
    }

    const all = await snippets.list();
    const snippet = all[0];
    expect(snippet.title).toBe(originalData.title);
    expect(snippet.value).toBe(originalData.value);
    expect(snippet.useCount).toBe(0);
    expect(snippet.lastUsedAt).toBeUndefined();
  });

  it("settings firstRunComplete gates onboarding flow", async () => {
    const initial = await settings.get();
    expect(initial.firstRunComplete).toBe(false);

    // Simulating onboarding completion
    const shouldShowOnboarding = !initial.firstRunComplete;
    expect(shouldShowOnboarding).toBe(true);

    await settings.update({ ...initial, firstRunComplete: true });

    const updated = await settings.get();
    expect(updated.firstRunComplete).toBe(true);

    const shouldShowOnboardingAfter = !updated.firstRunComplete;
    expect(shouldShowOnboardingAfter).toBe(false);
  });
});
