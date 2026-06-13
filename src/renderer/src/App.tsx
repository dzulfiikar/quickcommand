import { AlertTriangle, Loader2, ShieldAlert, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { InsertResult } from "../../shared/app-api";
import type { Settings } from "../../shared/settings-model";
import type { SnippetInput, SnippetRecord } from "../../shared/snippet-model";
import type { AppUpdateInfo } from "../../shared/update-model";
import { LibraryScreen } from "./features/LibraryScreen";
import { OnboardingScreen } from "./features/OnboardingScreen";
import { PaletteScreen } from "./features/PaletteScreen";
import type { ScreenProps } from "./features/screen-props";
import { TrayScreen } from "./features/TrayScreen";

const insertErrorMessages = {
  clipboard_restore_failed:
    "Pasted the snippet, but couldn't restore your previous clipboard.",
  helper_failed:
    "The macOS helper couldn't paste. Rebuild the helper or re-check Accessibility access.",
  not_trusted:
    "Accessibility permission is required before snippets can be pasted into other apps.",
} satisfies Record<Exclude<InsertResult, { ok: true }>["reason"], string>;

const insertErrorActionable = new Set<
  Exclude<InsertResult, { ok: true }>["reason"]
>(["not_trusted"]);

/** Extract a readable message from Zod or generic errors. */
function friendlyError(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    // Zod errors come through IPC as serialized JSON strings.
    try {
      const parsed = JSON.parse(error.message);
      if (Array.isArray(parsed)) {
        return parsed
          .map(
            (issue: { path?: string[]; message?: string }) =>
              issue.message ?? "Invalid value",
          )
          .join(". ");
      }
    } catch {
      // Not JSON, use the message directly.
    }
    return error.message;
  }
  return fallback;
}

type ScreenState = {
  error: string | null;
  loading: boolean;
  permissionGranted: boolean;
  query: string;
  saving: boolean;
  settings: Settings | null;
  snippets: SnippetRecord[];
};

type UpdateState = {
  checking: boolean;
  error: string | null;
  info: AppUpdateInfo | null;
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

const defaultUpdateState: UpdateState = {
  checking: false,
  error: null,
  info: null,
};

export function App() {
  const kind = window.quickCommand.app.getWindowKind();
  const [state, setState] = useState<ScreenState>(defaultScreenState);
  const [updateState, setUpdateState] =
    useState<UpdateState>(defaultUpdateState);
  const [draft, setDraft] = useState<SnippetInput>(emptySnippet);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hotkeyWarning, setHotkeyWarning] = useState<string | null>(null);
  const queryRef = useRef(defaultScreenState.query);

  const refresh = useCallback(
    async (nextQuery = queryRef.current, showLoading = false) => {
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
          error: friendlyError(error, "Failed to load QuickCommand data."),
          loading: false,
        }));
      }
    },
    [],
  );

  useEffect(() => {
    queryRef.current = state.query;
  }, [state.query]);

  useEffect(() => {
    void refresh("", true);

    const cleanupSnippets = window.quickCommand.app.onSnippetsChanged(() => {
      void refresh();
    });
    const cleanupHotkey = window.quickCommand.app.onHotkeyRegistrationFailed(
      () => {
        setHotkeyWarning(
          "The selected global shortcut is unavailable. Pick another in Settings.",
        );
      },
    );

    return () => {
      cleanupSnippets();
      cleanupHotkey();
    };
  }, [refresh]);

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

  // Resolve the theme preference to a concrete data-theme attribute on the
  // document root. "system" follows the OS, re-resolving when it changes.
  const themePreference = state.settings?.theme ?? "system";
  useEffect(() => {
    const root = document.documentElement;

    if (themePreference !== "system") {
      root.dataset.theme = themePreference;
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      root.dataset.theme = media.matches ? "dark" : "light";
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [themePreference]);

  // Resolve the color palette to a concrete data-palette attribute. This axis
  // is independent of light/dark: each palette ships both variants in CSS, so
  // the data-theme effect above picks which one shows.
  const palettePreference = state.settings?.palette ?? "sand";
  useEffect(() => {
    document.documentElement.dataset.palette = palettePreference;
  }, [palettePreference]);

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

  const handleQueryChange = useCallback(
    (query: string) => {
      void refresh(query);
    },
    [refresh],
  );

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
        error: friendlyError(error, "Failed to save snippet."),
      }));
    } finally {
      setState((current) => ({ ...current, saving: false }));
    }
  }

  async function removeSnippet(id: string): Promise<boolean> {
    try {
      await window.quickCommand.snippets.remove(id);
      await refresh(state.query);
      return true;
    } catch (error) {
      setState((current) => ({
        ...current,
        error: friendlyError(error, "Failed to delete snippet."),
      }));
      return false;
    }
  }

  async function insertSnippet(id: string) {
    try {
      const result = await window.quickCommand.snippets.insert(id);
      handleInsertResult(result);
    } catch (error) {
      setState((current) => ({
        ...current,
        error: friendlyError(error, "Failed to paste snippet."),
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
        error: friendlyError(error, "Failed to paste snippet."),
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

  async function checkForUpdates() {
    setUpdateState((current) => ({
      ...current,
      checking: true,
      error: null,
    }));

    try {
      const info = await window.quickCommand.app.checkForUpdates();
      setUpdateState({
        checking: false,
        error: null,
        info,
      });
    } catch (error) {
      setUpdateState((current) => ({
        ...current,
        checking: false,
        error: friendlyError(
          error,
          "Failed to check GitHub Releases for updates.",
        ),
      }));
    }
  }

  async function openUpdateDownload() {
    if (!updateState.info) {
      return;
    }

    try {
      await window.quickCommand.app.openUpdateDownload(
        updateState.info.downloadUrl,
      );
    } catch (error) {
      setUpdateState((current) => ({
        ...current,
        error: friendlyError(error, "Failed to open the update download."),
      }));
    }
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
    onCheckForUpdates: checkForUpdates,
    onCompleteOnboarding: completeOnboarding,
    onDraftChange: setDraft,
    onImport: () =>
      window.quickCommand.snippets
        .importFromDialog()
        .then(() => refresh(state.query)),
    onInsert: insertSnippet,
    onInsertText: insertSnippetText,
    onNewSnippet: newSnippet,
    onOpenUpdateDownload: openUpdateDownload,
    onQueryChange: handleQueryChange,
    onQuit: () => window.quickCommand.app.quit(),
    onRemove: removeSnippet,
    onSaveSettings: updateSettings,
    onSubmitSnippet: submitSnippet,
    onExport: () => window.quickCommand.snippets.exportToDialog(),
    onShowLibrary: () => window.quickCommand.app.showLibrary(),
    permissionGranted: state.permissionGranted,
    query: state.query,
    saving: state.saving,
    settings: state.settings,
    updateChecking: updateState.checking,
    updateError: updateState.error,
    updateInfo: updateState.info,
  };

  const content = renderScreen(kind, screenProps);

  const showAccessibilityRecovery =
    state.error?.toLowerCase().includes("accessibility") ?? false;

  return (
    <div className="app-shell h-[100dvh] flex flex-col overflow-hidden">
      <main
        className={cn(
          "flex-1 flex min-h-0 flex-col p-4",
          kind === "library" && "pt-10",
          kind === "onboarding" && "pt-10",
          kind === "palette" && "pt-9",
        )}
      >
        {kind === "library" ? (
          <div className="drag-region absolute inset-x-0 top-0 h-9" />
        ) : null}

        {state.loading ? (
          <div
            className="flex items-center justify-center gap-2 py-12 text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : (
          <div className="flex-1 min-h-0">{content}</div>
        )}

        <div
          aria-live="polite"
          aria-atomic="true"
          className="pointer-events-none absolute inset-x-0 bottom-3 z-40 flex flex-col items-center gap-2 px-4"
        >
          {hotkeyWarning ? (
            <Toast
              variant="warning"
              icon={
                <AlertTriangle
                  className="h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
              }
              onDismiss={() => setHotkeyWarning(null)}
              action={null}
            >
              {hotkeyWarning}
            </Toast>
          ) : null}

          {state.error ? (
            <Toast
              variant="error"
              icon={
                <AlertTriangle
                  className="h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
              }
              onDismiss={() =>
                setState((current) => ({ ...current, error: null }))
              }
              action={
                showAccessibilityRecovery ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void promptAccessibility()}
                  >
                    <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                    Grant access
                  </Button>
                ) : null
              }
            >
              {state.error}
            </Toast>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function Toast(props: {
  children: React.ReactNode;
  variant: "warning" | "error";
  icon: React.ReactNode;
  action: React.ReactNode | null;
  onDismiss(): void;
}) {
  const variantClass =
    props.variant === "warning"
      ? "notice notice--warning"
      : "notice notice--error";

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto flex w-full max-w-[36rem] items-center gap-3 px-4 py-3 text-base",
        variantClass,
      )}
    >
      {props.icon}
      <span className="flex-1 leading-snug">{props.children}</span>
      {props.action}
      <button
        type="button"
        aria-label="Dismiss"
        className="-m-1 inline-flex size-8 items-center justify-center rounded-md text-current/80 hover:text-current"
        onClick={props.onDismiss}
      >
        <X className="h-4 w-4" />
      </button>
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
