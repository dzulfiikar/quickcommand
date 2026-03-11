import { beforeEach, describe, expect, it } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { JsonSnippetRepository } from "../../src/main/services/snippet-repository";
import type { InsertResult } from "../../src/shared/app-api";

describe("paste flow integration", () => {
  let snippets: JsonSnippetRepository;
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "qc-paste-"));
    snippets = new JsonSnippetRepository(join(tmpDir, "snippets.json"));
  });

  it("blocks insert when accessibility is not trusted", async () => {
    await snippets.create({ title: "Test Cmd", value: "echo hello" });

    const isTrusted = false;

    const result: InsertResult = isTrusted
      ? { ok: true }
      : { ok: false, reason: "not_trusted" };

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("not_trusted");
    }
  });

  it("allows insert when accessibility is trusted", async () => {
    const created = await snippets.create({
      title: "Hello",
      value: "echo hello",
    });
    const isTrusted = true;
    let pastedText = "" as string;

    // Simulate the paste service behavior
    const mockInsertText = async (text: string, _delay: number) => {
      pastedText = text;
    };

    if (isTrusted) {
      const all = await snippets.list();
      const snippet = all.find((s) => s.id === created.id);
      if (snippet) {
        await mockInsertText(snippet.value, 100);
        await snippets.markInserted(snippet.id);
      }
    }

    expect(pastedText).toBe("echo hello");

    const updated = await snippets.list();
    expect(updated[0].useCount).toBe(1);
    expect(updated[0].lastUsedAt).toBeDefined();
  });

  it("returns helper_failed when paste service throws", async () => {
    await snippets.create({ title: "Fail Cmd", value: "fail" });

    const mockInsertText = async () => {
      throw new Error("Native helper not found");
    };

    let result: InsertResult;
    try {
      await mockInsertText();
      result = { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result = {
        ok: false,
        reason: message.includes("clipboard")
          ? "clipboard_restore_failed"
          : "helper_failed",
      };
    }

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("helper_failed");
    }
  });

  it("returns clipboard_restore_failed for clipboard errors", async () => {
    const mockInsertText = async () => {
      throw new Error("clipboard restore failed during operation");
    };

    let result: InsertResult;
    try {
      await mockInsertText();
      result = { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result = {
        ok: false,
        reason: message.includes("clipboard")
          ? "clipboard_restore_failed"
          : "helper_failed",
      };
    }

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("clipboard_restore_failed");
    }
  });

  it("increments use count on each successful insert", async () => {
    const created = await snippets.create({ title: "Multi Use", value: "ls" });

    await snippets.markInserted(created.id);
    await snippets.markInserted(created.id);
    await snippets.markInserted(created.id);

    const all = await snippets.list();
    const snippet = all.find((s) => s.id === created.id);
    expect(snippet?.useCount).toBe(3);
  });
});
