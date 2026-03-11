import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { JsonSnippetRepository } from "../../src/main/services/snippet-repository";

describe("JsonSnippetRepository", () => {
  let tempDir: string;
  let repository: JsonSnippetRepository;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "quickcommand-snippets-"));
    repository = new JsonSnippetRepository(join(tempDir, "snippets.json"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  test("creates and lists snippets", async () => {
    const created = await repository.create({
      title: "Run tests",
      value: "bun test",
    });

    const all = await repository.list();

    expect(created.id).toBeString();
    expect(all).toHaveLength(1);
    expect(all[0]?.title).toBe("Run tests");
    expect(all[0]?.useCount).toBe(0);
  });

  test("updates and removes snippets", async () => {
    const created = await repository.create({
      title: "Old title",
      value: "echo old",
    });

    const updated = await repository.update(created.id, {
      title: "New title",
      value: "echo new",
    });

    await repository.remove(created.id);
    const all = await repository.list();

    expect(updated.title).toBe("New title");
    expect(all).toHaveLength(0);
  });

  test("exports and imports snippets using the versioned bundle format", async () => {
    await repository.create({
      title: "Git pull",
      value: "git pull",
    });

    const bundle = await repository.exportBundle();
    const secondRepository = new JsonSnippetRepository(
      join(tempDir, "imported.json"),
    );

    const result = await secondRepository.importBundle(bundle);
    const imported = await secondRepository.list();

    expect(result.imported).toBe(1);
    expect(imported[0]?.title).toBe("Git pull");
    expect(bundle.version).toBe(1);
  });

  test("persists snippets to disk", async () => {
    await repository.create({
      title: "Persist me",
      value: "echo persist",
    });

    const raw = await readFile(join(tempDir, "snippets.json"), "utf8");

    expect(raw).toContain("Persist me");
    expect(raw).toContain("echo persist");
  });
});
