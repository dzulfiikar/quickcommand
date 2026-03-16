import { Download, Upload } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { Settings } from "../../../shared/settings-model";

export const SettingsPanel = memo(function SettingsPanel(props: {
  onExport?(): Promise<{ path: string | null }>;
  onImport?(): Promise<void>;
  settings: Settings;
  onSaveSettings(patch: Partial<Settings>): Promise<void>;
  showClipboardDelay?: boolean;
}) {
  const [shortcut, setShortcut] = useState(props.settings.globalShortcut ?? "");

  useEffect(() => {
    setShortcut(props.settings.globalShortcut ?? "");
  }, [props.settings.globalShortcut]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const value = shortcut.trim() || null;
      if (value !== props.settings.globalShortcut) {
        void props.onSaveSettings({ globalShortcut: value });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [shortcut, props.onSaveSettings, props.settings.globalShortcut]);

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Global shortcut</Label>
        <Input
          className="h-9 bg-background/50 border-border/60 font-mono text-[13px]"
          value={shortcut}
          onChange={(event) => setShortcut(event.target.value)}
        />
      </div>
      {props.showClipboardDelay ? (
        <>
          <Separator className="bg-border/40" />
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Clipboard restore delay (ms)
            </Label>
            <Input
              className="h-9 bg-background/50 border-border/60 font-mono text-[13px]"
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
          </div>
        </>
      ) : null}
      <Separator className="bg-border/40" />
      <div className="flex items-center justify-between">
        <Label className="text-sm text-foreground cursor-pointer">
          Launch at login
        </Label>
        <Switch
          checked={props.settings.launchAtLogin}
          onCheckedChange={(checked) =>
            void props.onSaveSettings({ launchAtLogin: checked })
          }
        />
      </div>
      <Separator className="bg-border/40" />
      <div className="flex items-center justify-between">
        <Label className="text-sm text-foreground cursor-pointer">
          Show window on startup
        </Label>
        <Switch
          checked={props.settings.showWindowOnStartup}
          onCheckedChange={(checked) =>
            void props.onSaveSettings({ showWindowOnStartup: checked })
          }
        />
      </div>
      {props.onImport || props.onExport ? (
        <>
          <Separator className="bg-border/40" />
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Snippet data
            </Label>
            <div className="flex items-center gap-2">
              {props.onImport ? (
                <Button
                  size="sm"
                  className="h-8 flex-1 px-3 text-xs gap-1.5 pressable"
                  onClick={() => void props.onImport?.()}
                >
                  <Download className="h-3.5 w-3.5" />
                  Import snippets
                </Button>
              ) : null}
              {props.onExport ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 flex-1 px-3 text-xs gap-1.5 pressable"
                  onClick={() => void props.onExport?.()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Export snippets
                </Button>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
});
