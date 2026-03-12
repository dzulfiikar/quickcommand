import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (state.permissionGranted || state.loading) {
      stopPolling();
      return;
    }

    if (pollRef.current) return;

    pollRef.current = setInterval(async () => {
      try {
        const granted = await window.quickCommand.settings.checkAccessibility();
        if (granted) {
          setState((current) => ({ ...current, permissionGranted: true }));
          stopPolling();
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);

    return stopPolling;
  }, [state.permissionGranted, state.loading, stopPolling]);

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

  const handleQueryChange = useCallback((query: string) => {
    void refresh(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function promptAccessibility() {
    const granted = await window.quickCommand.settings.promptAccessibility();
    setState((current) => ({ ...current, permissionGranted: granted }));
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
    onAccessibilityPrompt: promptAccessibility,
    onCompleteOnboarding: completeOnboarding,
    onDraftChange: setDraft,
    onImport: () =>
      window.quickCommand.snippets
        .importFromDialog()
        .then(() => refresh(state.query)),
    onInsert: insertSnippet,
    onInsertText: insertSnippetText,
    onNewSnippet: newSnippet,
    onQueryChange: handleQueryChange,
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
  const showHeader = kind === "library" || kind === "onboarding";

  return (
    <div className="h-screen mesh-bg flex flex-col overflow-hidden">
      <main
        className={cn(
          "flex-1 flex flex-col min-h-0 p-4",
          kind === "library" && "pt-10",
          kind === "onboarding" && "pt-10",
          kind === "palette" && "pt-9",
        )}
      >
        {/* Header — only for library and onboarding */}
        {showHeader && (
          <header className="drag-region flex items-center justify-between gap-3 mb-4 pb-3.5 border-b border-border/40">
            <div className="no-drag">
              <p className="text-[10px] font-bold tracking-widest uppercase text-primary">
                QuickCommand
              </p>
              <h1 className="text-[15px] font-semibold text-foreground mt-0.5">
                {kind === "onboarding" && "Welcome"}
                {kind === "library" && "Snippet Library"}
              </h1>
            </div>
            {state.settings ? (
              <div className="no-drag flex gap-1.5">
                <Badge
                  variant="secondary"
                  className="text-[11px] font-normal px-2 py-0.5 bg-secondary/50"
                >
                  {state.settings.globalShortcut ?? "No hotkey configured"}
                </Badge>
                <Badge
                  variant={
                    state.permissionGranted ? "secondary" : "destructive"
                  }
                  className={cn(
                    "text-[11px] font-normal px-2 py-0.5",
                    state.permissionGranted && "bg-secondary/50",
                  )}
                >
                  {state.permissionGranted
                    ? "Accessibility ready"
                    : "Accessibility required"}
                </Badge>
              </div>
            ) : null}
          </header>
        )}

        {/* Error banner */}
        {state.error ? (
          <div className="mb-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3.5 text-[13px] text-red-300 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              <span className="flex-1">{state.error}</span>
              {state.error.includes("Accessibility") ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] border-destructive/30 text-red-300 hover:bg-destructive/10 shrink-0"
                  onClick={() => void promptAccessibility()}
                >
                  <ShieldAlert className="h-3 w-3 mr-1" />
                  Grant Access
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Permission warning */}
        {!state.permissionGranted && !state.loading && kind !== "onboarding" ? (
          <div className="mb-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3.5 text-[13px] text-yellow-300">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0" />
              <span className="flex-1">Accessibility access is required to paste snippets.</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10 shrink-0"
                onClick={() => void promptAccessibility()}
              >
                <ShieldAlert className="h-3 w-3 mr-1" />
                Grant Access
              </Button>
            </div>
          </div>
        ) : null}

        {/* Hotkey warning */}
        {hotkeyWarning ? (
          <div className="mb-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3.5 text-[13px] text-yellow-300">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0" />
              <span className="flex-1">{hotkeyWarning}</span>
            </div>
          </div>
        ) : null}

        {/* Loading */}
        {state.loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading QuickCommand…</span>
          </div>
        ) : (
          <div className="flex-1 min-h-0">{content}</div>
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
