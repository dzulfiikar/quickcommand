import type { Settings } from "../../../shared/settings-model";
import type {
  SnippetInput,
  SnippetRecord,
} from "../../../shared/snippet-model";
import type { AppUpdateInfo } from "../../../shared/update-model";

export type ScreenProps = {
  draft: SnippetInput;
  editSnippet(snippet: SnippetRecord): void;
  editingId: string | null;
  filtered: SnippetRecord[];
  onAccessibilityOpen(): Promise<void>;
  onAccessibilityPrompt(): Promise<void>;
  onCheckForUpdates(): Promise<void>;
  onCompleteOnboarding(): Promise<void>;
  onDraftChange(value: SnippetInput): void;
  onExport(): Promise<{ path: string | null }>;
  onImport(): Promise<void>;
  onInsert(id: string): Promise<void>;
  onInsertText(id: string, text: string): Promise<void>;
  onNewSnippet(): void;
  onOpenUpdateDownload(): Promise<void>;
  onQueryChange(query: string): void;
  onQuit(): Promise<void>;
  onRemove(id: string): Promise<boolean>;
  onSaveSettings(patch: Partial<Settings>): Promise<void>;
  onShowLibrary(): Promise<void>;
  onSubmitSnippet(event: React.FormEvent): Promise<void>;
  permissionGranted: boolean;
  query: string;
  saving: boolean;
  settings: Settings | null;
  updateChecking: boolean;
  updateError: string | null;
  updateInfo: AppUpdateInfo | null;
};
