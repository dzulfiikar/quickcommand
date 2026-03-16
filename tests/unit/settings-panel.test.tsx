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

    expect(html).toContain("Import snippets");
    expect(html).toContain("Export snippets");
  });
});
