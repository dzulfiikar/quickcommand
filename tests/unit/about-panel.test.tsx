import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AboutPanel } from "../../src/renderer/src/components/AboutPanel";
import type { AppUpdateInfo } from "../../src/shared/update-model";

(globalThis as { __APP_VERSION__?: string }).__APP_VERSION__ = "1.5.1";

const updateInfo: AppUpdateInfo = {
  availability: "update-available",
  autoInstallSupported: false,
  checkedAt: "2026-03-16T21:58:09.095Z",
  currentVersion: "1.5.1",
  downloadUrl:
    "https://github.com/dzulfiikar/quickcommand/releases/download/v1.5.2/QuickCommand-1.5.2-arm64.zip",
  latestVersion: "1.5.2",
  releaseName: "QuickCommand 1.5.2",
  releaseNotes:
    "Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10",
  releasePublishedAt: "2026-03-16T21:58:09.095Z",
  releaseUrl: "https://github.com/dzulfiikar/quickcommand/releases/tag/v1.5.2",
};

describe("AboutPanel", () => {
  test("renders release notes inside a scrollable area", () => {
    const html = renderToStaticMarkup(
      <AboutPanel
        onCheckForUpdates={async () => {}}
        onOpenUpdateDownload={async () => {}}
        updateChecking={false}
        updateError={null}
        updateInfo={updateInfo}
      />,
    );

    expect(html).toContain("Release notes");
    expect(html).toContain('data-slot="scroll-area"');
    expect(html).toContain("max-h-40");
  });
});
