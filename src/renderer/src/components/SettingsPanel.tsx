import { Check, Download, Monitor, Moon, Sun, Upload } from "lucide-react";
import { memo, useEffect, useId, useState } from "react";
import { ShortcutRecorder } from "@/components/ShortcutRecorder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type {
  PalettePreference,
  Settings,
  ThemePreference,
} from "../../../shared/settings-model";

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: typeof Monitor;
}[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

/**
 * Each color theme and its signature accent. The `swatch` is the palette's
 * dark-mode primary in OKLCH (the recognizable hue), shown literally on the
 * chip so the picker reads true regardless of the current light/dark mode.
 * Keep these in lockstep with the --primary tokens in styles.css.
 */
const PALETTE_OPTIONS: {
  value: PalettePreference;
  label: string;
  swatch: string;
}[] = [
  { value: "sand", label: "Sand", swatch: "oklch(0.82 0.03 78)" },
  { value: "nord", label: "Nord", swatch: "oklch(0.79 0.06 215)" },
  { value: "dracula", label: "Dracula", swatch: "oklch(0.74 0.15 300)" },
  {
    value: "tokyo-night",
    label: "Tokyo Night",
    swatch: "oklch(0.7 0.13 264)",
  },
  { value: "gruvbox", label: "Gruvbox", swatch: "oklch(0.72 0.16 52)" },
  { value: "solarized", label: "Solarized", swatch: "oklch(0.62 0.13 245)" },
];

function PalettePicker(props: {
  value: PalettePreference;
  onChange(value: PalettePreference): void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="flex flex-wrap gap-2.5"
    >
      {PALETTE_OPTIONS.map((option) => {
        const selected = props.value === option.value;
        return (
          // biome-ignore lint/a11y/useSemanticElements: a color swatch can't be a native radio input without losing the circular fill; button + role="radio" is the WAI-ARIA pattern and keeps free keyboard/focus behavior. Mirrors ThemeSwitcher above.
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            title={option.label}
            onClick={() => props.onChange(option.value)}
            className={cn(
              "pressable group relative flex size-9 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              selected
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "ring-1 ring-border hover:ring-border-strong",
            )}
          >
            <span
              aria-hidden="true"
              className="size-7 rounded-full shadow-[inset_0_1px_0_oklch(1_0_0_/_28%),inset_0_-2px_4px_oklch(0_0_0_/_18%)]"
              style={{ background: option.swatch }}
            />
            {selected ? (
              <Check
                className="absolute size-4 text-white drop-shadow-[0_1px_1px_oklch(0_0_0_/_45%)]"
                strokeWidth={3}
                aria-hidden="true"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function ThemeSwitcher(props: {
  value: ThemePreference;
  onChange(value: ThemePreference): void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Appearance"
      className="grid grid-cols-3 gap-1 rounded-lg bg-[var(--surface-inset)] p-1"
    >
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = props.value === option.value;
        return (
          // biome-ignore lint/a11y/useSemanticElements: a segmented control has no native element; button + role="radio" is the WAI-ARIA pattern and keeps free keyboard/focus behavior.
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={cn(
              "pressable flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              selected
                ? "bg-[var(--surface-3)] text-foreground shadow-[var(--elevation-1)]"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => props.onChange(option.value)}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

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
  const [shortcutSavedAt, setShortcutSavedAt] = useState<number | null>(null);

  async function handleShortcutChange(value: string | null) {
    if (value === (props.settings.globalShortcut ?? null)) return;
    await props.onSaveSettings({ globalShortcut: value });
    setShortcutSavedAt(Date.now());
  }

  useEffect(() => {
    if (shortcutSavedAt === null) return;
    const timer = setTimeout(() => setShortcutSavedAt(null), 1500);
    return () => clearTimeout(timer);
  }, [shortcutSavedAt]);

  return (
    <div className="flex flex-col gap-7">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2.5">
          <header className="space-y-1">
            <Label className="text-base text-foreground">Appearance</Label>
            <p className="field-note">
              Match the system, or lock QuickCommand to light or dark.
            </p>
          </header>
          <ThemeSwitcher
            value={props.settings.theme}
            onChange={(theme) => void props.onSaveSettings({ theme })}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <header className="space-y-1">
            <Label className="text-base text-foreground">Color theme</Label>
            <p className="field-note">
              The accent and surface palette worn across every window. Each
              works in both light and dark.
            </p>
          </header>
          <PalettePicker
            value={props.settings.palette}
            onChange={(palette) => void props.onSaveSettings({ palette })}
          />
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <header className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={shortcutId} className="text-base text-foreground">
              Global shortcut
            </Label>
            <span aria-live="polite" className="text-xs text-muted-foreground">
              {shortcutSavedAt ? "Saved" : null}
            </span>
          </div>
          <p id={`${shortcutId}-hint`} className="field-note">
            The keystroke that summons QuickCommand from any app. Click below
            and press the keys you want.
          </p>
        </header>
        <ShortcutRecorder
          id={shortcutId}
          value={props.settings.globalShortcut}
          onChange={(value) => void handleShortcutChange(value)}
          aria-describedby={`${shortcutId}-hint`}
        />
      </section>

      {props.showClipboardDelay ? (
        <section className="flex flex-col gap-2.5">
          <header className="space-y-1">
            <Label htmlFor={delayId} className="text-base text-foreground">
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
              className="w-32 font-mono text-base"
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
                className="cursor-pointer text-base text-foreground"
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
                className="cursor-pointer text-base text-foreground"
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
