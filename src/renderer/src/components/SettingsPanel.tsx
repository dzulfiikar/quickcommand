import { memo, useEffect, useState } from "react";
import type { Settings } from "../../../shared/settings-model";

export const SettingsPanel = memo(function SettingsPanel(props: {
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
  }, [shortcut]);

  return (
    <div className="settings-grid">
      <label>
        <span>Global shortcut</span>
        <input
          value={shortcut}
          onChange={(event) => setShortcut(event.target.value)}
        />
      </label>
      {props.showClipboardDelay ? (
        <label>
          <span>Clipboard restore delay (ms)</span>
          <input
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
        </label>
      ) : null}
      <label className="checkbox">
        <input
          checked={props.settings.launchAtLogin}
          type="checkbox"
          onChange={(event) =>
            void props.onSaveSettings({
              launchAtLogin: event.target.checked,
            })
          }
        />
        <span>Launch at login</span>
      </label>
    </div>
  );
});
