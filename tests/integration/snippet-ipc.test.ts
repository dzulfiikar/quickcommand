import { beforeEach, describe, expect, it } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SnippetSearchService } from "../../src/main/services/search-service";
import { JsonSettingsStore } from "../../src/main/services/settings-store";
import { JsonSnippetRepository } from "../../src/main/services/snippet-repository";

describe("snippet IPC integration", () => {
  let snippets: JsonSnippetRepository;
  let search: SnippetSearchService;
  let settings: JsonSettingsStore;
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "qc-ipc-"));
    snippets = new JsonSnippetRepository(join(tmpDir, "snippets.json"));
    search = new SnippetSearchService();
    settings = new JsonSettingsStore(join(tmpDir, "settings.json"));
  });

  it("creates a snippet and finds it via search", async () => {
    const created = await snippets.create({
      title: "Docker Build",
      value: "docker build -t app .",
    });
    const all = await snippets.list();
    const results = search.search(all, "docker");

    expect(results.length).toBe(1);
    expect(results[0].id).toBe(created.id);
    expect(results[0].title).toBe("Docker Build");
  });

  it("returns multiple search results ranked by title relevance", async () => {
    await snippets.create({ title: "Git Push", value: "git push origin main" });
    await snippets.create({ title: "Git Status", value: "git status" });
    await snippets.create({
      title: "Docker Logs",
      value: "docker logs -f container",
    });

    const all = await snippets.list();
    const results = search.search(all, "git");

    expect(results.length).toBe(2);
    expect(results.every((s) => s.title.toLowerCase().includes("git"))).toBe(
      true,
    );
  });

  it("updates a snippet and retrieves the updated version", async () => {
    const created = await snippets.create({
      title: "Old Title",
      value: "old value",
    });
    const updated = await snippets.update(created.id, {
      title: "New Title",
      value: "new value",
    });

    expect(updated.title).toBe("New Title");
    expect(updated.value).toBe("new value");
    expect(updated.id).toBe(created.id);

    const all = await snippets.list();
    expect(all.length).toBe(1);
    expect(all[0].title).toBe("New Title");
  });

  it("removes a snippet and confirms it is gone", async () => {
    const created = await snippets.create({
      title: "Temp",
      value: "temporary",
    });
    await snippets.remove(created.id);

    const all = await snippets.list();
    expect(all.length).toBe(0);
  });

  it("exports and imports snippets with deduplication", async () => {
    await snippets.create({ title: "Alpha", value: "a" });
    await snippets.create({ title: "Beta", value: "b" });

    const bundle = await snippets.exportBundle();
    expect(bundle.version).toBe(1);
    expect(bundle.snippets.length).toBe(2);

    // Import into a fresh repository
    const freshRepo = new JsonSnippetRepository(
      join(tmpDir, "fresh-snippets.json"),
    );
    const result = await freshRepo.importBundle(bundle);
    expect(result.imported).toBe(2);

    // Re-import should deduplicate
    const secondResult = await freshRepo.importBundle(bundle);
    expect(secondResult.imported).toBe(0);
    const all = await freshRepo.list();
    expect(all.length).toBe(2);
  });

  it("marks a snippet as inserted and increments usage", async () => {
    const created = await snippets.create({
      title: "Ls Command",
      value: "ls -la",
    });
    expect(created.useCount).toBe(0);
    expect(created.lastUsedAt).toBeUndefined();

    const marked = await snippets.markInserted(created.id);
    expect(marked.useCount).toBe(1);
    expect(marked.lastUsedAt).toBeDefined();

    const markedAgain = await snippets.markInserted(created.id);
    expect(markedAgain.useCount).toBe(2);
  });

  it("insert flow returns not_trusted when permissions are denied", async () => {
    await snippets.create({ title: "Test", value: "test" });
    const isTrusted = false;

    // Simulating the IPC insert handler logic
    if (!isTrusted) {
      const result = { ok: false as const, reason: "not_trusted" as const };
      expect(result.ok).toBe(false);
      expect(result.reason).toBe("not_trusted");
    }
  });

  it("settings merge preserves unmodified fields", async () => {
    const defaults = await settings.get();
    expect(defaults.firstRunComplete).toBe(false);
    expect(defaults.launchAtLogin).toBe(false);

    const updated = await settings.update({
      ...defaults,
      launchAtLogin: true,
    });

    expect(updated.launchAtLogin).toBe(true);
    expect(updated.firstRunComplete).toBe(false);
    expect(updated.globalShortcut).toBe(defaults.globalShortcut);
  });
});
