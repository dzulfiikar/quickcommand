/**
 * Mock preload API for browser preview.
 * Loaded before main.tsx so window.quickCommand is available.
 */
import type { InsertResult } from "../../shared/app-api";
import type { Settings } from "../../shared/settings-model";
import type { SnippetInput, SnippetRecord } from "../../shared/snippet-model";

const sampleSnippets: SnippetRecord[] = [
  {
    id: "1",
    title: "Hello World",
    value: 'echo "Hello, World!"',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    useCount: 5,
  },
  {
    id: "2",
    title: "Git Status",
    value: "git status --short",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    useCount: 12,
  },
  {
    id: "3",
    title: "Greeting Template",
    value: "Hello {{name}}, welcome to {{place}}!",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    useCount: 3,
  },
];

let nextId = 100;
let snippets = [...sampleSnippets];

const defaultSettings: Settings = {
  globalShortcut: "CommandOrControl+Alt+Space",
  launchAtLogin: false,
  pasteRestoreDelayMs: 150,
  firstRunComplete: true,
  showWindowOnStartup: false,
};

let settings = { ...defaultSettings };

const mockAPI = {
  snippets: {
    async list(): Promise<SnippetRecord[]> {
      return snippets;
    },
    async search(query: string): Promise<SnippetRecord[]> {
      if (!query) return snippets;
      const q = query.toLowerCase();
      return snippets.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.value.toLowerCase().includes(q),
      );
    },
    async create(input: SnippetInput): Promise<SnippetRecord> {
      const record: SnippetRecord = {
        id: String(nextId++),
        title: input.title,
        value: input.value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        useCount: 0,
      };
      snippets.push(record);
      return record;
    },
    async update(id: string, input: SnippetInput): Promise<SnippetRecord> {
      const idx = snippets.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error("Not found");
      snippets[idx] = {
        ...snippets[idx],
        ...input,
        updatedAt: new Date().toISOString(),
      };
      return snippets[idx];
    },
    async remove(id: string): Promise<void> {
      snippets = snippets.filter((s) => s.id !== id);
    },
    async insert(_id: string): Promise<InsertResult> {
      console.log("[mock] insert snippet", _id);
      return { ok: true };
    },
    async insertText(_id: string, _text: string): Promise<InsertResult> {
      console.log("[mock] insertText", _id, _text);
      return { ok: true };
    },
    async importFromDialog(): Promise<{ imported: number }> {
      console.log("[mock] importFromDialog");
      return { imported: 0 };
    },
    async exportToDialog(): Promise<{ path: string | null }> {
      console.log("[mock] exportToDialog");
      return { path: null };
    },
  },
  settings: {
    async get(): Promise<Settings> {
      return settings;
    },
    async update(patch: Partial<Settings>): Promise<Settings> {
      settings = { ...settings, ...patch };
      return settings;
    },
    async checkAccessibility(): Promise<boolean> {
      return true;
    },
    async openAccessibilitySettings(): Promise<void> {
      console.log("[mock] openAccessibilitySettings");
    },
    async promptAccessibility(): Promise<boolean> {
      return true;
    },
  },
  app: {
    async showLibrary(): Promise<void> {
      window.location.hash = "#library";
      window.location.reload();
    },
    async showOnboarding(): Promise<void> {
      window.location.hash = "#onboarding";
      window.location.reload();
    },
    async hidePalette(): Promise<void> {
      console.log("[mock] hidePalette");
    },
    async quit(): Promise<void> {
      console.log("[mock] quit");
    },
    getWindowKind(): string {
      const hash = window.location.hash.replace("#", "");
      if (["palette", "library", "onboarding", "tray"].includes(hash))
        return hash;
      return "library";
    },
    onSnippetsChanged(_cb: () => void): () => void {
      return () => {};
    },
    onHotkeyRegistrationFailed(_cb: () => void): () => void {
      return () => {};
    },
  },
};

// Inject into window
(window as unknown as Record<string, unknown>).quickCommand = mockAPI;
