import { beforeEach, describe, expect, it, mock } from "bun:test";

// Exercise the REAL PermissionsService.isAccessibilityTrusted against a mocked
// electron systemPreferences. Regression guard: the gate must rely on the
// app-level trust only, and must NOT re-gate on the helper's own standalone
// `check-accessibility` (which reports the helper binary's separate TCC
// identity and returns false even when the app is granted — that false
// negative is exactly what blocked paste).

let electronTrusted = false;

mock.module("electron", () => ({
  systemPreferences: {
    isTrustedAccessibilityClient: (_prompt: boolean) => electronTrusted,
  },
  // Superset so this global mock does not break sibling electron-mocking tests.
  app: { hide: () => {} },
  BrowserWindow: { fromWebContents: () => ({ hide: () => {} }) },
  ipcMain: { handle: () => {} },
  dialog: {},
  clipboard: {
    clear: () => {},
    writeText: () => {},
    readText: () => "",
    availableFormats: () => [],
    readBuffer: () => Buffer.alloc(0),
    writeBuffer: () => {},
  },
}));

const { PermissionsService } = await import(
  "../../src/main/services/permissions-service"
);

// A helper stub whose standalone check-accessibility ALWAYS reports false,
// mirroring the real spawned-binary behavior. If the gate consults it, the
// test for the granted case will fail — which is the regression we guard.
function makeHelper(checkResult: string) {
  return {
    run: mock(async (command: string) => {
      if (command === "check-accessibility") return checkResult;
      return "";
    }),
  };
}

describe("PermissionsService.isAccessibilityTrusted", () => {
  beforeEach(() => {
    electronTrusted = false;
  });

  it("returns false when the app is not trusted", async () => {
    electronTrusted = false;
    // biome-ignore lint/suspicious/noExplicitAny: helper stub
    const service = new PermissionsService(makeHelper("false") as any);
    expect(await service.isAccessibilityTrusted()).toBe(false);
  });

  it("returns true when the app is trusted, even if the helper's standalone check says false", async () => {
    electronTrusted = true;
    const helper = makeHelper("false");
    // biome-ignore lint/suspicious/noExplicitAny: helper stub
    const service = new PermissionsService(helper as any);

    expect(await service.isAccessibilityTrusted()).toBe(true);
    // The gate must not depend on the helper's standalone accessibility check.
    expect(helper.run).not.toHaveBeenCalledWith("check-accessibility");
  });
});
