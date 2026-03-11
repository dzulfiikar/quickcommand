import { contextBridge, ipcRenderer } from "electron";

import { channels } from "../main/ipc/channels";
import type { QuickCommandAPI } from "../shared/app-api";

function reportRendererIssue(
  type: "error" | "unhandledrejection",
  payload: Record<string, unknown>,
) {
  ipcRenderer.send(channels.diagnosticsLog, {
    ...payload,
    type,
    url: window.location.href,
  });
}

window.addEventListener("error", (event) => {
  reportRendererIssue("error", {
    column: event.colno,
    filename: event.filename,
    line: event.lineno,
    message: event.message,
  });
});

window.addEventListener("unhandledrejection", (event) => {
  const reason =
    event.reason instanceof Error
      ? {
          message: event.reason.message,
          name: event.reason.name,
          stack: event.reason.stack,
        }
      : { value: String(event.reason) };

  reportRendererIssue("unhandledrejection", {
    reason,
  });
});

const api: QuickCommandAPI = {
  snippets: {
    list: () => ipcRenderer.invoke(channels.snippetsList),
    search: (query) => ipcRenderer.invoke(channels.snippetsSearch, query),
    create: (input) => ipcRenderer.invoke(channels.snippetsCreate, input),
    update: (id, input) =>
      ipcRenderer.invoke(channels.snippetsUpdate, id, input),
    remove: (id) => ipcRenderer.invoke(channels.snippetsRemove, id),
    insert: (id) => ipcRenderer.invoke(channels.snippetsInsert, id),
    importFromDialog: () => ipcRenderer.invoke(channels.snippetsImportDialog),
    exportToDialog: () => ipcRenderer.invoke(channels.snippetsExportDialog),
  },
  settings: {
    get: () => ipcRenderer.invoke(channels.settingsGet),
    update: (patch) => ipcRenderer.invoke(channels.settingsUpdate, patch),
    checkAccessibility: () =>
      ipcRenderer.invoke(channels.settingsCheckAccessibility),
    openAccessibilitySettings: () =>
      ipcRenderer.invoke(channels.settingsOpenAccessibility),
  },
  app: {
    showLibrary: () => ipcRenderer.invoke(channels.appShowLibrary),
    showOnboarding: () => ipcRenderer.invoke(channels.appShowOnboarding),
    hidePalette: () => ipcRenderer.invoke(channels.appHidePalette),
    quit: () => ipcRenderer.invoke(channels.appQuit),
    getWindowKind: () => {
      const hash = window.location.hash.replace("#", "");

      if (
        hash === "palette" ||
        hash === "library" ||
        hash === "onboarding" ||
        hash === "tray"
      ) {
        return hash;
      }

      return "library";
    },
    onSnippetsChanged: (callback) => {
      const listener = () => callback();
      ipcRenderer.on(channels.eventSnippetsChanged, listener);
      return () =>
        ipcRenderer.removeListener(channels.eventSnippetsChanged, listener);
    },
    onHotkeyRegistrationFailed: (callback) => {
      const listener = () => callback();
      ipcRenderer.on(channels.eventHotkeyRegistrationFailed, listener);
      return () =>
        ipcRenderer.removeListener(
          channels.eventHotkeyRegistrationFailed,
          listener,
        );
    },
  },
};

contextBridge.exposeInMainWorld("quickCommand", api);
