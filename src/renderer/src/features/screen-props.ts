import type { Settings } from "../../../shared/settings-model";
import type {
  SnippetInput,
  SnippetRecord,
} from "../../../shared/snippet-model";

export type ScreenProps = {
  draft: SnippetInput;
  editSnippet(snippet: SnippetRecord): void;
  editingId: string | null;
  filtered: SnippetRecord[];
  onAccessibilityOpen(): Promise<void>;
  onCompleteOnboarding(): Promise<void>;
  onDraftChange(value: SnippetInput): void;
  onExport(): Promise<{ path: string | null }>;
  onImport(): Promise<void>;
  onInsert(id: string): Promise<void>;
  onInsertText(id: string, text: string): Promise<void>;
  onNewSnippet(): void;
  onQueryChange(query: string): void;
  onQuit(): Promise<void>;
  onRemove(id: string): Promise<void>;
  onSaveSettings(patch: Partial<Settings>): Promise<void>;
  onShowLibrary(): Promise<void>;
  onSubmitSnippet(event: React.FormEvent): Promise<void>;
  permissionGranted: boolean;
  saving: boolean;
  settings: Settings | null;
};
