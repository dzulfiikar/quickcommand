import { beforeEach, describe, expect, it, mock } from "bun:test";

// Drive the REAL snippets IPC insert handler with a mocked Electron surface so
// we can assert the ordering the paste bug was about: a trusted insert must
// hide the palette window AND the app, then paste the snippet value. A failure
// to reach the paste call (or to hide the window) is the regression.

type Handler = (event: unknown, ...args: unknown[]) => unknown;

const registeredHandlers = new Map<string, Handler>();
const events: string[] = [];

const senderWindow = {
  hide: mock(() => {
    events.push("window:hide");
  }),
};

const appHide = mock(() => {
  events.push("app:hide");
});

mock.module("electron", () => ({
  app: { hide: appHide },
  BrowserWindow: {
    fromWebContents: () => senderWindow,
  },
  ipcMain: {
    handle: (channel: string, handler: Handler) => {
      registeredHandlers.set(channel, handler);
    },
  },
  dialog: {},
  // Included so this mock is a superset usable by any module that imports
  // electron — mock.module is global, so a partial mock would break other
  // test files that touch systemPreferences/clipboard.
  systemPreferences: {
    isTrustedAccessibilityClient: () => false,
  },
  clipboard: {
    clear: () => {},
    writeText: () => {},
    readText: () => "",
    availableFormats: () => [],
    readBuffer: () => Buffer.alloc(0),
    writeBuffer: () => {},
  },
}));

// Imported AFTER the mock so the handler binds to the mocked electron module.
const { registerSnippetHandlers } = await import("../../src/main/ipc/snippets");
const { channels } = await import("../../src/main/ipc/channels");

function buildServices(opts: {
  trusted: boolean;
  pasteThrows?: Error;
}) {
  const pasteCalls: Array<{ text: string; delay: number }> = [];
  const services = {
    settings: { get: async () => ({ pasteRestoreDelayMs: 150 }) },
    permissions: { isAccessibilityTrusted: async () => opts.trusted },
    snippets: {
      list: async () => [{ id: "s1", value: "echo hello", title: "Hello" }],
      markInserted: mock(async () => {
        events.push("markInserted");
      }),
    },
    paste: {
      insertText: async (text: string, delay: number) => {
        if (opts.pasteThrows) throw opts.pasteThrows;
        events.push("paste:insertText");
        pasteCalls.push({ text, delay });
      },
    },
    // biome-ignore lint/suspicious/noExplicitAny: minimal stub for unused fields
  } as any;
  return { services, pasteCalls };
}

function getInsertHandler(): Handler {
  const handler = registeredHandlers.get(channels.snippetsInsert);
  if (!handler) throw new Error("insert handler not registered");
  return handler;
}

describe("snippets insert IPC handler (real handler, mocked electron)", () => {
  beforeEach(() => {
    registeredHandlers.clear();
    events.length = 0;
    senderWindow.hide.mockClear();
    appHide.mockClear();
  });

  it("hides the window, hides the app, then pastes the snippet value when trusted", async () => {
    const { services, pasteCalls } = buildServices({ trusted: true });
    registerSnippetHandlers(services, { onSnippetsChanged() {} });

    const result = await getInsertHandler()({ sender: {} }, "s1");

    expect(result).toEqual({ ok: true });
    // The window must hide before the paste reaches the previously focused app.
    expect(senderWindow.hide).toHaveBeenCalledTimes(1);
    expect(appHide).toHaveBeenCalledTimes(1);
    expect(pasteCalls).toEqual([{ text: "echo hello", delay: 150 }]);
    // Ordering: window hidden -> app hidden -> paste fired.
    expect(events.indexOf("window:hide")).toBeLessThan(
      events.indexOf("app:hide"),
    );
    expect(events.indexOf("app:hide")).toBeLessThan(
      events.indexOf("paste:insertText"),
    );
  });

  it("does not hide or paste when accessibility is not trusted", async () => {
    const { services, pasteCalls } = buildServices({ trusted: false });
    registerSnippetHandlers(services, { onSnippetsChanged() {} });

    const result = await getInsertHandler()({ sender: {} }, "s1");

    expect(result).toEqual({ ok: false, reason: "not_trusted" });
    expect(senderWindow.hide).not.toHaveBeenCalled();
    expect(appHide).not.toHaveBeenCalled();
    expect(pasteCalls).toHaveLength(0);
  });

  it("surfaces helper_failed when the paste service throws", async () => {
    const { services } = buildServices({
      trusted: true,
      pasteThrows: new Error("Native helper not found"),
    });
    registerSnippetHandlers(services, { onSnippetsChanged() {} });

    const result = await getInsertHandler()({ sender: {} }, "s1");

    expect(result).toEqual({ ok: false, reason: "helper_failed" });
    // Window was still hidden before the failed paste attempt.
    expect(senderWindow.hide).toHaveBeenCalledTimes(1);
  });
});
