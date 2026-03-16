import { describe, expect, it } from "bun:test";

import { AppUpdateService } from "../../src/main/services/update-service";

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
    },
    status: 200,
    ...init,
  });
}

describe("AppUpdateService", () => {
  it("reports an available update and picks the matching macOS asset", async () => {
    let requestedUrl = "";

    const service = new AppUpdateService({
      arch: "arm64",
      currentVersion: "1.4.0",
      fetch: async (url) => {
        requestedUrl = String(url);

        return jsonResponse({
          assets: [
            {
              browser_download_url:
                "https://github.com/dzulfiikar/quickcommand/releases/download/v1.5.0/QuickCommand-1.5.0-x64.dmg",
              name: "QuickCommand-1.5.0-x64.dmg",
            },
            {
              browser_download_url:
                "https://github.com/dzulfiikar/quickcommand/releases/download/v1.5.0/QuickCommand-1.5.0-arm64.dmg",
              name: "QuickCommand-1.5.0-arm64.dmg",
            },
          ],
          body: "Bug fixes and polish",
          html_url:
            "https://github.com/dzulfiikar/quickcommand/releases/tag/v1.5.0",
          name: "QuickCommand 1.5.0",
          published_at: "2026-03-17T01:00:00.000Z",
          tag_name: "v1.5.0",
        });
      },
      now: () => new Date("2026-03-17T02:00:00.000Z"),
      openExternal: async () => {},
      owner: "dzulfiikar",
      repo: "quickcommand",
    });

    const result = await service.checkForUpdates();

    expect(requestedUrl).toBe(
      "https://api.github.com/repos/dzulfiikar/quickcommand/releases/latest",
    );
    expect(result.availability).toBe("update-available");
    expect(result.autoInstallSupported).toBe(false);
    expect(result.currentVersion).toBe("1.4.0");
    expect(result.latestVersion).toBe("1.5.0");
    expect(result.downloadUrl).toBe(
      "https://github.com/dzulfiikar/quickcommand/releases/download/v1.5.0/QuickCommand-1.5.0-arm64.dmg",
    );
    expect(result.releaseUrl).toBe(
      "https://github.com/dzulfiikar/quickcommand/releases/tag/v1.5.0",
    );
    expect(result.checkedAt).toBe("2026-03-17T02:00:00.000Z");
  });

  it("reports up to date when the latest release matches the installed version", async () => {
    const service = new AppUpdateService({
      arch: "arm64",
      currentVersion: "1.5.0",
      fetch: async () =>
        jsonResponse({
          assets: [],
          body: "",
          html_url:
            "https://github.com/dzulfiikar/quickcommand/releases/tag/v1.5.0",
          name: "QuickCommand 1.5.0",
          published_at: "2026-03-17T01:00:00.000Z",
          tag_name: "v1.5.0",
        }),
      now: () => new Date("2026-03-17T02:00:00.000Z"),
      openExternal: async () => {},
      owner: "dzulfiikar",
      repo: "quickcommand",
    });

    const result = await service.checkForUpdates();

    expect(result.availability).toBe("up-to-date");
    expect(result.latestVersion).toBe("1.5.0");
    expect(result.downloadUrl).toBe(
      "https://github.com/dzulfiikar/quickcommand/releases/tag/v1.5.0",
    );
  });

  it("falls back to the release page when no matching artifact exists", async () => {
    const service = new AppUpdateService({
      arch: "arm64",
      currentVersion: "1.4.0",
      fetch: async () =>
        jsonResponse({
          assets: [
            {
              browser_download_url:
                "https://example.com/QuickCommand-1.5.0.txt",
              name: "QuickCommand-1.5.0.txt",
            },
          ],
          body: "",
          html_url:
            "https://github.com/dzulfiikar/quickcommand/releases/tag/v1.5.0",
          name: "QuickCommand 1.5.0",
          published_at: "2026-03-17T01:00:00.000Z",
          tag_name: "v1.5.0",
        }),
      now: () => new Date("2026-03-17T02:00:00.000Z"),
      openExternal: async () => {},
      owner: "dzulfiikar",
      repo: "quickcommand",
    });

    const result = await service.checkForUpdates();

    expect(result.downloadUrl).toBe(
      "https://github.com/dzulfiikar/quickcommand/releases/tag/v1.5.0",
    );
  });

  it("opens the selected download URL in the external browser", async () => {
    const opened: string[] = [];

    const service = new AppUpdateService({
      arch: "arm64",
      currentVersion: "1.4.0",
      fetch: async () => {
        throw new Error("unused");
      },
      now: () => new Date("2026-03-17T02:00:00.000Z"),
      openExternal: async (url) => {
        opened.push(url);
      },
      owner: "dzulfiikar",
      repo: "quickcommand",
    });

    await service.openUpdateDownload(
      "https://github.com/dzulfiikar/quickcommand/releases/tag/v1.5.0",
    );

    expect(opened).toEqual([
      "https://github.com/dzulfiikar/quickcommand/releases/tag/v1.5.0",
    ]);
  });

  it("surfaces a clear error when the release check fails", async () => {
    const service = new AppUpdateService({
      arch: "arm64",
      currentVersion: "1.4.0",
      fetch: async () =>
        jsonResponse(
          {
            message: "rate limited",
          },
          {
            status: 403,
          },
        ),
      now: () => new Date("2026-03-17T02:00:00.000Z"),
      openExternal: async () => {},
      owner: "dzulfiikar",
      repo: "quickcommand",
    });

    await expect(service.checkForUpdates()).rejects.toThrow(
      "GitHub release check failed with status 403",
    );
  });
});
