import type { Settings } from "./settings-model";
import type { SnippetInput, SnippetRecord } from "./snippet-model";

export type WindowKind = "palette" | "library" | "onboarding" | "tray";

export type InsertResult =
  | { ok: true }
  | {
      ok: false;
      reason: "not_trusted" | "helper_failed" | "clipboard_restore_failed";
    };

export interface QuickCommandAPI {
  snippets: {
    list(): Promise<SnippetRecord[]>;
    search(query: string): Promise<SnippetRecord[]>;
    create(input: SnippetInput): Promise<SnippetRecord>;
    update(id: string, input: SnippetInput): Promise<SnippetRecord>;
    remove(id: string): Promise<void>;
    insert(id: string): Promise<InsertResult>;
    insertText(id: string, text: string): Promise<InsertResult>;
    importFromDialog(): Promise<{ imported: number }>;
    exportToDialog(): Promise<{ path: string | null }>;
  };
  settings: {
    get(): Promise<Settings>;
    update(patch: Partial<Settings>): Promise<Settings>;
    checkAccessibility(): Promise<boolean>;
    openAccessibilitySettings(): Promise<void>;
  };
  app: {
    showLibrary(): Promise<void>;
    showOnboarding(): Promise<void>;
    hidePalette(): Promise<void>;
    quit(): Promise<void>;
    getWindowKind(): WindowKind;
    onSnippetsChanged(callback: () => void): () => void;
    onHotkeyRegistrationFailed(callback: () => void): () => void;
  };
}
