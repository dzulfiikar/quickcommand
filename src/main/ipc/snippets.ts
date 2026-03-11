import { readFile, writeFile } from "node:fs/promises";
import { BrowserWindow, app, dialog, ipcMain } from "electron";
import type { InsertResult } from "../../shared/app-api";
import {
  exportBundleSchema,
  snippetInputSchema,
} from "../../shared/snippet-model";
import type { AppServices } from "../services/app-services";
import { channels } from "./channels";

type SnippetCallbacks = {
  onSnippetsChanged(): void;
};

export function registerSnippetHandlers(
  services: AppServices,
  callbacks: SnippetCallbacks,
): void {
  ipcMain.handle(channels.snippetsList, async () => services.snippets.list());

  ipcMain.handle(channels.snippetsSearch, async (_event, query: string) => {
    const snippets = await services.snippets.list();
    return services.search.search(snippets, query);
  });

  ipcMain.handle(channels.snippetsCreate, async (_event, input) => {
    const created = await services.snippets.create(
      snippetInputSchema.parse(input),
    );
    callbacks.onSnippetsChanged();
    return created;
  });

  ipcMain.handle(channels.snippetsUpdate, async (_event, id: string, input) => {
    const updated = await services.snippets.update(
      id,
      snippetInputSchema.parse(input),
    );
    callbacks.onSnippetsChanged();
    return updated;
  });

  ipcMain.handle(channels.snippetsRemove, async (_event, id: string) => {
    await services.snippets.remove(id);
    callbacks.onSnippetsChanged();
  });

  ipcMain.handle(
    channels.snippetsInsert,
    async (_event, id: string): Promise<InsertResult> => {
      try {
        const settings = await services.settings.get();
        const trusted = await services.permissions.isAccessibilityTrusted();

        if (!trusted) {
          return { ok: false, reason: "not_trusted" };
        }

        const snippets = await services.snippets.list();
        const snippet = snippets.find((item) => item.id === id);

        if (!snippet) {
          throw new Error(`Snippet not found: ${id}`);
        }

        // Hide the calling window before paste so the previously focused app receives Cmd+V
        const senderWindow = BrowserWindow.fromWebContents(_event.sender);
        if (senderWindow) {
          senderWindow.hide();
        }
        // Deactivate the entire Electron app so macOS restores focus to the previous application
        app.hide();
        await new Promise((resolve) => setTimeout(resolve, 200));

        await services.paste.insertText(
          snippet.value,
          settings.pasteRestoreDelayMs,
        );
        await services.snippets.markInserted(id);
        callbacks.onSnippetsChanged();
        return { ok: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          ok: false,
          reason: message.includes("clipboard")
            ? "clipboard_restore_failed"
            : "helper_failed",
        };
      }
    },
  );

  ipcMain.handle(
    channels.snippetsInsertText,
    async (_event, id: string, text: string): Promise<InsertResult> => {
      try {
        const settings = await services.settings.get();
        const trusted = await services.permissions.isAccessibilityTrusted();

        if (!trusted) {
          return { ok: false, reason: "not_trusted" };
        }

        const senderWindow = BrowserWindow.fromWebContents(_event.sender);
        if (senderWindow) {
          senderWindow.hide();
        }
        app.hide();
        await new Promise((resolve) => setTimeout(resolve, 200));

        await services.paste.insertText(text, settings.pasteRestoreDelayMs);
        await services.snippets.markInserted(id);
        callbacks.onSnippetsChanged();
        return { ok: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          ok: false,
          reason: message.includes("clipboard")
            ? "clipboard_restore_failed"
            : "helper_failed",
        };
      }
    },
  );

  ipcMain.handle(channels.snippetsImportDialog, async () => {
    const selected = await dialog.showOpenDialog({
      filters: [{ name: "QuickCommand Export", extensions: ["json"] }],
      properties: ["openFile"],
    });

    if (selected.canceled || selected.filePaths.length === 0) {
      return { imported: 0 };
    }

    const raw = await readFile(selected.filePaths[0], "utf8");
    const bundle = exportBundleSchema.parse(JSON.parse(raw) as unknown);
    const result = await services.snippets.importBundle(bundle);
    callbacks.onSnippetsChanged();
    return result;
  });

  ipcMain.handle(channels.snippetsExportDialog, async () => {
    const selected = await dialog.showSaveDialog({
      defaultPath: "quickcommand-export.json",
      filters: [{ name: "QuickCommand Export", extensions: ["json"] }],
    });

    if (selected.canceled || !selected.filePath) {
      return { path: null };
    }

    const bundle = await services.snippets.exportBundle();
    await writeFile(selected.filePath, JSON.stringify(bundle, null, 2), "utf8");
    return { path: selected.filePath };
  });
}
