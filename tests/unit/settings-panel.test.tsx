import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { SettingsPanel } from "../../src/renderer/src/components/SettingsPanel";
import { defaultSettings } from "../../src/shared/settings-model";

describe("SettingsPanel", () => {
  test("renders import and export actions inside settings when provided", () => {
    const html = renderToStaticMarkup(
      <SettingsPanel
        {...({
          onExport: async () => ({ path: null }),
          onImport: async () => {},
          onSaveSettings: async () => {},
          settings: defaultSettings,
          showClipboardDelay: true,
        } as unknown as Parameters<typeof SettingsPanel>[0])}
      />,
    );

    expect(html).toContain("Snippet data");
    expect(html).toContain(">Import<");
    expect(html).toContain(">Export<");
  });

  test("shows the global shortcut as a press-to-record control, not raw accelerator syntax", () => {
    const html = renderToStaticMarkup(
      <SettingsPanel
        {...({
          onSaveSettings: async () => {},
          settings: defaultSettings,
        } as unknown as Parameters<typeof SettingsPanel>[0])}
      />,
    );

    // Current shortcut surfaces as mac glyphs (CommandOrControl+Alt+Space).
    expect(html).toContain("⌘⌥Space");
    // The recorder and its clear affordance are present.
    expect(html).toContain("Clear shortcut");
    // The technical accelerator string is no longer asked of the user.
    expect(html).not.toContain("CommandOrControl+Alt+Space");
  });
});
