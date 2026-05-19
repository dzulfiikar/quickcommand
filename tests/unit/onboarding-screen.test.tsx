import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { OnboardingScreen } from "../../src/renderer/src/features/OnboardingScreen";
import type { ScreenProps } from "../../src/renderer/src/features/screen-props";
import { defaultSettings } from "../../src/shared/settings-model";

const screenProps: ScreenProps = {
  draft: { title: "", value: "" },
  editSnippet: () => {},
  editingId: null,
  filtered: [],
  onAccessibilityOpen: async () => {},
  onAccessibilityPrompt: async () => {},
  onCheckForUpdates: async () => {},
  onCompleteOnboarding: async () => {},
  onDraftChange: () => {},
  onExport: async () => ({ path: null }),
  onImport: async () => {},
  onInsert: async () => {},
  onInsertText: async () => {},
  onNewSnippet: () => {},
  onOpenUpdateDownload: async () => {},
  onQueryChange: () => {},
  onQuit: async () => {},
  onRemove: async () => true,
  onSaveSettings: async () => {},
  onShowLibrary: async () => {},
  onSubmitSnippet: async () => {},
  permissionGranted: false,
  query: "",
  saving: false,
  settings: defaultSettings,
  updateChecking: false,
  updateError: null,
  updateInfo: null,
};

describe("OnboardingScreen", () => {
  test("renders a labeled setup checklist on the welcome step", () => {
    const html = renderToStaticMarkup(<OnboardingScreen {...screenProps} />);

    expect(html).toContain("Setup");
    expect(html).toContain("Overview");
    expect(html).toContain("Accessibility");
    expect(html).toContain("Shortcut");
  });
});
