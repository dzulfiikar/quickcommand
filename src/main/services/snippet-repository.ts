import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import {
  type ExportBundleV1,
  exportBundleSchema,
  type SnippetInput,
  type SnippetRecord,
  snippetFileSchema,
  snippetInputSchema,
} from "../../shared/snippet-model";

export class JsonSnippetRepository {
  constructor(private readonly filePath: string) {}

  async list(): Promise<SnippetRecord[]> {
    return (await this.readFile()).snippets;
  }

  async create(input: SnippetInput): Promise<SnippetRecord> {
    const parsed = snippetInputSchema.parse(input);
    const existing = await this.readFile();
    const now = new Date().toISOString();
    const snippet: SnippetRecord = {
      id: randomUUID(),
      title: parsed.title,
      value: parsed.value,
      createdAt: now,
      updatedAt: now,
      useCount: 0,
    };

    existing.snippets.unshift(snippet);
    await this.writeFile(existing.snippets);
    return snippet;
  }

  async update(id: string, input: SnippetInput): Promise<SnippetRecord> {
    const parsed = snippetInputSchema.parse(input);
    const existing = await this.readFile();
    const index = existing.snippets.findIndex((snippet) => snippet.id === id);

    if (index === -1) {
      throw new Error(`Snippet not found: ${id}`);
    }

    const current = existing.snippets[index];
    if (!current) {
      throw new Error(`Snippet not found: ${id}`);
    }

    const updated: SnippetRecord = {
      ...current,
      title: parsed.title,
      value: parsed.value,
      updatedAt: new Date().toISOString(),
    };

    existing.snippets[index] = updated;
    await this.writeFile(existing.snippets);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const existing = await this.readFile();
    const nextSnippets = existing.snippets.filter(
      (snippet) => snippet.id !== id,
    );
    await this.writeFile(nextSnippets);
  }

  async markInserted(id: string): Promise<SnippetRecord> {
    const existing = await this.readFile();
    const index = existing.snippets.findIndex((snippet) => snippet.id === id);

    if (index === -1) {
      throw new Error(`Snippet not found: ${id}`);
    }

    const current = existing.snippets[index];
    if (!current) {
      throw new Error(`Snippet not found: ${id}`);
    }

    const updated: SnippetRecord = {
      ...current,
      lastUsedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      useCount: current.useCount + 1,
    };

    existing.snippets[index] = updated;
    await this.writeFile(existing.snippets);
    return updated;
  }

  async exportBundle(): Promise<ExportBundleV1> {
    return exportBundleSchema.parse({
      version: 1,
      exportedAt: new Date().toISOString(),
      snippets: await this.list(),
    });
  }

  async importBundle(bundle: ExportBundleV1): Promise<{ imported: number }> {
    const parsed = exportBundleSchema.parse(bundle);
    const existing = await this.readFile();
    const seenIds = new Set(existing.snippets.map((snippet) => snippet.id));
    const imported = parsed.snippets.filter(
      (snippet) => !seenIds.has(snippet.id),
    );
    await this.writeFile([...imported, ...existing.snippets]);
    return { imported: imported.length };
  }

  private async readFile(): Promise<{ snippets: SnippetRecord[] }> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      return snippetFileSchema.parse(parsed);
    } catch (error) {
      if (isMissingFileError(error)) {
        return { snippets: [] };
      }

      throw error;
    }
  }

  private async writeFile(snippets: SnippetRecord[]): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const payload = snippetFileSchema.parse({ snippets });
    await writeFile(this.filePath, JSON.stringify(payload, null, 2), "utf8");
  }
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
