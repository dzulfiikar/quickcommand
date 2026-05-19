import { Download, Upload } from "lucide-react";
import { memo, useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatShortcut, validateShortcut } from "@/lib/shortcut";
import type { Settings } from "../../../shared/settings-model";

export const SettingsPanel = memo(function SettingsPanel(props: {
  onExport?(): Promise<{ path: string | null }>;
  onImport?(): Promise<void>;
  settings: Settings;
  onSaveSettings(patch: Partial<Settings>): Promise<void>;
  showClipboardDelay?: boolean;
}) {
  const shortcutId = useId();
  const delayId = useId();
  const launchAtLoginId = useId();
  const startupId = useId();
  const [shortcut, setShortcut] = useState(props.settings.globalShortcut ?? "");
  const [shortcutFocused, setShortcutFocused] = useState(false);
  const [shortcutSavedAt, setShortcutSavedAt] = useState<number | null>(null);

  const validation = validateShortcut(shortcut);
  const showShortcutError = !validation.ok && shortcut.trim().length > 0;
  const friendlyShortcut = formatShortcut(shortcut);

  useEffect(() => {
    setShortcut(props.settings.globalShortcut ?? "");
  }, [props.settings.globalShortcut]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const value = shortcut.trim() || null;
      const result = validateShortcut(shortcut);
      if (!result.ok) return;
      if (value === props.settings.globalShortcut) return;

      await props.onSaveSettings({ globalShortcut: value });
      setShortcutSavedAt(Date.now());
    }, 400);
    return () => clearTimeout(timer);
  }, [shortcut, props.onSaveSettings, props.settings.globalShortcut]);

  useEffect(() => {
    if (shortcutSavedAt === null) return;
    const timer = setTimeout(() => setShortcutSavedAt(null), 1500);
    return () => clearTimeout(timer);
  }, [shortcutSavedAt]);

  return (
    <div className="flex flex-col gap-7">
      <section className="flex flex-col gap-2.5">
        <header className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={shortcutId} className="text-[13px] text-foreground">
              Global shortcut
            </Label>
            <span
              aria-live="polite"
              className="text-[11px] text-muted-foreground"
            >
              {showShortcutError
                ? null
                : shortcutSavedAt
                  ? "Saved"
                  : shortcutFocused || shortcut
                    ? friendlyShortcut
                    : null}
            </span>
          </div>
          <p className="field-note">
            The keystroke that summons QuickCommand from any app. Use the
            modifier names your keyboard sends (e.g.{" "}
            <code className="font-mono">CommandOrControl+Alt+Space</code>).
          </p>
        </header>
        <Input
          id={shortcutId}
          className="font-mono text-[13px]"
          value={shortcut}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          aria-invalid={showShortcutError ? true : undefined}
          aria-describedby={
            showShortcutError ? `${shortcutId}-error` : undefined
          }
          onFocus={() => setShortcutFocused(true)}
          onBlur={() => setShortcutFocused(false)}
          onChange={(event) => setShortcut(event.target.value)}
        />
        {showShortcutError && !validation.ok ? (
          <p
            id={`${shortcutId}-error`}
            className="text-[11px] text-destructive-foreground"
          >
            {validation.reason}
          </p>
        ) : null}
      </section>

      {props.showClipboardDelay ? (
        <section className="flex flex-col gap-2.5">
          <header className="space-y-1">
            <Label htmlFor={delayId} className="text-[13px] text-foreground">
              Clipboard restore delay
            </Label>
            <p className="field-note">
              Milliseconds to wait after pasting before restoring your previous
              clipboard. Raise this if a paste sometimes leaves the wrong text
              on the clipboard.
            </p>
          </header>
          <div className="flex items-center gap-3">
            <Input
              id={delayId}
              className="w-32 font-mono text-[13px]"
              min={0}
              step={10}
              type="number"
              value={props.settings.pasteRestoreDelayMs}
              onChange={(event) =>
                void props.onSaveSettings({
                  pasteRestoreDelayMs: Number(event.target.value),
                })
              }
            />
            <span className="field-note">ms</span>
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <header>
          <p className="section-label">Behavior</p>
        </header>
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-4 border-t border-border py-3 first:border-t-0">
            <div className="space-y-1">
              <Label
                htmlFor={launchAtLoginId}
                className="cursor-pointer text-[13px] text-foreground"
              >
                Launch at login
              </Label>
              <p className="field-note">
                Start QuickCommand when your macOS session begins.
              </p>
            </div>
            <Switch
              id={launchAtLoginId}
              size="sm"
              checked={props.settings.launchAtLogin}
              onCheckedChange={(checked) =>
                void props.onSaveSettings({ launchAtLogin: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border py-3">
            <div className="space-y-1">
              <Label
                htmlFor={startupId}
                className="cursor-pointer text-[13px] text-foreground"
              >
                Show library on startup
              </Label>
              <p className="field-note">
                Open the full library window after launch instead of staying
                tucked into the menu bar.
              </p>
            </div>
            <Switch
              id={startupId}
              size="sm"
              checked={props.settings.showWindowOnStartup}
              onCheckedChange={(checked) =>
                void props.onSaveSettings({ showWindowOnStartup: checked })
              }
            />
          </div>
        </div>
      </section>

      {props.onImport || props.onExport ? (
        <section className="flex flex-col gap-2.5">
          <header className="space-y-1">
            <p className="section-label">Snippet data</p>
            <p className="field-note">
              QuickCommand stores snippets locally. Import to add to the current
              library; export to back up or move to another machine.
            </p>
          </header>
          <div className="flex items-center gap-2">
            {props.onImport ? (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1.5"
                onClick={() => void props.onImport?.()}
              >
                <Download className="h-3.5 w-3.5" />
                Import
              </Button>
            ) : null}
            {props.onExport ? (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => void props.onExport?.()}
              >
                <Upload className="h-3.5 w-3.5" />
                Export
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
});
