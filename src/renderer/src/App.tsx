import { useEffect, useState } from "react";
import type { InsertResult } from "../../shared/app-api";
import type { Settings } from "../../shared/settings-model";
import type { SnippetInput, SnippetRecord } from "../../shared/snippet-model";
import { LibraryScreen } from "./features/LibraryScreen";
import { OnboardingScreen } from "./features/OnboardingScreen";
import { PaletteScreen } from "./features/PaletteScreen";
import type { ScreenProps } from "./features/screen-props";
import { TrayScreen } from "./features/TrayScreen";

const insertErrorMessages = {
  clipboard_restore_failed:
    "QuickCommand pasted the snippet, but restoring the previous clipboard content failed.",
  helper_failed:
    "The macOS helper failed to trigger paste. Rebuild the helper or recheck Accessibility access.",
  not_trusted:
    "Accessibility permission is required before snippets can be pasted into other apps.",
} satisfies Record<Exclude<InsertResult, { ok: true }>["reason"], string>;

type ScreenState = {
  error: string | null;
  loading: boolean;
  permissionGranted: boolean;
  query: string;
  saving: boolean;
  settings: Settings | null;
  snippets: SnippetRecord[];
};

const emptySnippet: SnippetInput = {
  title: "",
  value: "",
};

const defaultScreenState: ScreenState = {
  error: null,
  loading: true,
  permissionGranted: false,
  query: "",
  saving: false,
  settings: null,
  snippets: [],
};

export function App() {
  const kind = window.quickCommand.app.getWindowKind();
  const [state, setState] = useState<ScreenState>(defaultScreenState);
  const [draft, setDraft] = useState<SnippetInput>(emptySnippet);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hotkeyWarning, setHotkeyWarning] = useState<string | null>(null);

  useEffect(() => {
    void refresh("", true);

    const cleanupSnippets = window.quickCommand.app.onSnippetsChanged(() => {
      void refresh();
    });
    const cleanupHotkey = window.quickCommand.app.onHotkeyRegistrationFailed(
      () => {
        setHotkeyWarning(
          "The selected global shortcut is unavailable. Pick another shortcut in settings.",
        );
      },
    );

    return () => {
      cleanupSnippets();
      cleanupHotkey();
    };
  }, []);

  useEffect(() => {
    if (kind === "palette") {
      const handler = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          void window.quickCommand.app.hidePalette();
        }
      };

      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }
  }, [kind]);

  const filtered = state.snippets;

  async function refresh(nextQuery = state.query, showLoading = false) {
    if (showLoading) {
      setState((current) => ({ ...current, loading: true, error: null }));
    } else {
      setState((current) => ({ ...current, error: null }));
    }

    try {
      if (showLoading) {
        const [settings, permissionGranted, snippets] = await Promise.all([
          window.quickCommand.settings.get(),
          window.quickCommand.settings.checkAccessibility(),
          window.quickCommand.snippets.search(nextQuery),
        ]);

        setState((current) => ({
          ...current,
          loading: false,
          permissionGranted,
          query: nextQuery,
          settings,
          snippets,
        }));
      } else {
        const snippets = await window.quickCommand.snippets.search(nextQuery);
        setState((current) => ({
          ...current,
          query: nextQuery,
          snippets,
        }));
      }
    } catch (error) {
      setState((current) => ({
        ...current,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load QuickCommand data.",
        loading: false,
      }));
    }
  }

  async function submitSnippet(event: React.FormEvent) {
    event.preventDefault();
    setState((current) => ({ ...current, saving: true, error: null }));

    try {
      if (editingId) {
        await window.quickCommand.snippets.update(editingId, draft);
      } else {
        await window.quickCommand.snippets.create(draft);
      }

      setDraft(emptySnippet);
      setEditingId(null);
      await refresh("");
    } catch (error) {
      setState((current) => ({
        ...current,
        error:
          error instanceof Error ? error.message : "Failed to save snippet.",
      }));
    } finally {
      setState((current) => ({ ...current, saving: false }));
    }
  }

  async function removeSnippet(id: string) {
    await window.quickCommand.snippets.remove(id);
    await refresh(state.query);
  }

  async function insertSnippet(id: string) {
    try {
      const result = await window.quickCommand.snippets.insert(id);
      handleInsertResult(result);
    } catch (error) {
      setState((current) => ({
        ...current,
        error:
          error instanceof Error ? error.message : "Failed to paste snippet.",
      }));
    }
    await refresh(state.query);
  }

  async function insertSnippetText(id: string, text: string) {
    try {
      const result = await window.quickCommand.snippets.insertText(id, text);
      handleInsertResult(result);
    } catch (error) {
      setState((current) => ({
        ...current,
        error:
          error instanceof Error ? error.message : "Failed to paste snippet.",
      }));
    }
    await refresh(state.query);
  }

  function editSnippet(snippet: SnippetRecord) {
    setEditingId(snippet.id);
    setDraft({
      title: snippet.title,
      value: snippet.value,
    });
  }

  async function updateSettings(patch: Partial<Settings>) {
    const settings = await window.quickCommand.settings.update(patch);
    setState((current) => ({ ...current, settings }));
  }

  function handleInsertResult(result: InsertResult) {
    if (result.ok) {
      setState((current) => ({ ...current, error: null }));
      return;
    }

    setState((current) => ({
      ...current,
      error: insertErrorMessages[result.reason],
    }));
  }

  async function completeOnboarding() {
    await updateSettings({ firstRunComplete: true });
    await window.quickCommand.app.showLibrary();
    window.close();
  }

  function newSnippet() {
    setEditingId(null);
    setDraft(emptySnippet);
  }

  const screenProps: ScreenProps = {
    draft,
    editSnippet,
    editingId,
    filtered,
    onAccessibilityOpen: () =>
      window.quickCommand.settings.openAccessibilitySettings(),
    onCompleteOnboarding: completeOnboarding,
    onDraftChange: setDraft,
    onImport: () =>
      window.quickCommand.snippets
        .importFromDialog()
        .then(() => refresh(state.query)),
    onInsert: insertSnippet,
    onInsertText: insertSnippetText,
    onNewSnippet: newSnippet,
    onQueryChange: (query) => {
      void refresh(query);
    },
    onQuit: () => window.quickCommand.app.quit(),
    onRemove: removeSnippet,
    onSaveSettings: updateSettings,
    onSubmitSnippet: submitSnippet,
    onExport: () => window.quickCommand.snippets.exportToDialog(),
    onShowLibrary: () => window.quickCommand.app.showLibrary(),
    permissionGranted: state.permissionGranted,
    saving: state.saving,
    settings: state.settings,
  };

  const content = renderScreen(kind, screenProps);

  return (
    <div className={`screen screen-${kind}`}>
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <main className="shell">
        <header className="hero">
          <div>
            <p className="eyebrow">QuickCommand</p>
            <h1>
              {kind === "palette" && "Quick Search"}
              {kind === "tray" && "Snippets"}
              {kind === "onboarding" && "Welcome"}
              {kind === "library" && "Snippet Library"}
            </h1>
          </div>
          {state.settings ? (
            <div className="meta">
              <span>
                {state.settings.globalShortcut ?? "No hotkey configured"}
              </span>
              <span>
                {state.permissionGranted
                  ? "Accessibility ready"
                  : "Accessibility required"}
              </span>
            </div>
          ) : null}
        </header>

        {state.error ? (
          <div className="banner banner-error">
            <span>{state.error}</span>
            {state.error.includes("Accessibility") ? (
              <button
                className="banner-action"
                type="button"
                onClick={() =>
                  void window.quickCommand.settings.openAccessibilitySettings()
                }
              >
                Open Accessibility Settings
              </button>
            ) : null}
          </div>
        ) : null}
        {hotkeyWarning ? (
          <div className="banner banner-warning">{hotkeyWarning}</div>
        ) : null}

        {state.loading ? (
          <div className="panel">Loading QuickCommand…</div>
        ) : (
          content
        )}
      </main>
    </div>
  );
}

function renderScreen(kind: string, props: ScreenProps) {
  switch (kind) {
    case "palette":
      return <PaletteScreen {...props} />;
    case "tray":
      return <TrayScreen {...props} />;
    case "onboarding":
      return <OnboardingScreen {...props} />;
    default:
      return <LibraryScreen {...props} />;
  }
}
