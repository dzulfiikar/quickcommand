import { join } from "node:path";
import {
  app,
  type BrowserWindow,
  globalShortcut,
  nativeImage,
  Tray,
} from "electron";

import { registerAutomationHandlers } from "./ipc/automation";
import { channels } from "./ipc/channels";
import { registerDiagnosticHandlers } from "./ipc/diagnostics";
import { registerSettingsHandlers } from "./ipc/settings";
import { registerSnippetHandlers } from "./ipc/snippets";
import { type AppServices, createAppServices } from "./services/app-services";
import { DiagnosticLogger } from "./services/diagnostic-logger";
import { createLibraryWindow } from "./windows/library-window";
import { createOnboardingWindow } from "./windows/onboarding-window";
import { createPaletteWindow } from "./windows/palette-window";
import {
  createTrayPopoverWindow,
  positionTrayPopover,
} from "./windows/tray-popover-window";
import {
  centerWindowOnActiveDisplay,
  loadWindow,
} from "./windows/window-loader";

type ManagedWindows = {
  library: BrowserWindow | null;
  onboarding: BrowserWindow | null;
  palette: BrowserWindow | null;
  tray: BrowserWindow | null;
};

let services: AppServices;
let logger: DiagnosticLogger | null = null;
let tray: Tray | null = null;
const windows: ManagedWindows = {
  library: null,
  onboarding: null,
  palette: null,
  tray: null,
};

process.on("uncaughtException", (error) => {
  logError("main", "Uncaught exception", error);
});

process.on("unhandledRejection", (reason) => {
  logError("main", "Unhandled rejection", reason);
});

void bootstrap().catch((error) => {
  logError("bootstrap", "Application bootstrap failed", error);
});

async function bootstrap(): Promise<void> {
  await app.whenReady();
  app.dock?.hide();
  app.setAppLogsPath();

  logger = new DiagnosticLogger(join(app.getPath("logs"), "quickcommand.log"));
  logInfo("bootstrap", "App ready", {
    logFilePath: logger.getLogFilePath(),
  });

  services = createAppServices(app.getPath("userData"));
  const settings = await services.settings.get();
  logInfo("bootstrap", "Settings loaded", {
    firstRunComplete: settings.firstRunComplete,
    globalShortcut: settings.globalShortcut,
  });

  registerHandlers();
  registerDiagnostics();
  createTray();
  registerShortcut(settings.globalShortcut);

  if (settings.firstRunComplete) {
    await showLibrary();
  } else {
    await showOnboarding();
  }

  app.on("activate", () => {
    logInfo("lifecycle", "App activated");
    void showLibrary();
  });

  app.on("will-quit", () => {
    logInfo("lifecycle", "App will quit");
    globalShortcut.unregisterAll();
  });
}

function registerHandlers(): void {
  registerSnippetHandlers(services, {
    onSnippetsChanged() {
      logInfo("snippets", "Snippet state changed");
      broadcast(channels.eventSnippetsChanged);
    },
  });

  registerDiagnosticHandlers(loggerOrThrow());
  registerSettingsHandlers(services, {
    async onSettingsUpdated() {
      const settings = await services.settings.get();
      logInfo("settings", "Settings updated", settings);
      registerShortcut(settings.globalShortcut);
    },
  });

  registerAutomationHandlers({
    hidePalette() {
      windows.palette?.hide();
    },
    showLibrary() {
      void showLibrary();
    },
    showOnboarding() {
      void showOnboarding();
    },
  });
}

function registerShortcut(accelerator: string | null): void {
  globalShortcut.unregisterAll();

  if (!accelerator) {
    logInfo("shortcut", "Global shortcut cleared");
    return;
  }

  const registered = globalShortcut.register(accelerator, () => {
    logInfo("shortcut", "Global shortcut invoked", { accelerator });
    void showPalette();
  });

  if (!registered) {
    logWarn("shortcut", "Global shortcut registration failed", { accelerator });
    broadcast(channels.eventHotkeyRegistrationFailed);
    return;
  }

  logInfo("shortcut", "Global shortcut registered", { accelerator });
}

function createTray(): void {
  tray = new Tray(createTrayImage());
  logInfo("tray", "Tray created");
  tray.setToolTip("QuickCommand");

  tray.on("click", () => {
    logInfo("tray", "Tray clicked");
    void toggleTrayPopover();
  });
}

async function toggleTrayPopover(): Promise<void> {
  const window = await ensureWindow("tray");

  if (window.isVisible()) {
    logInfo("window", "Tray popover hidden");
    window.hide();
    return;
  }

  if (tray) {
    positionTrayPopover(window, tray.getBounds());
  }

  window.show();
  window.focus();
  logInfo("window", "Tray popover shown");
}

async function showPalette(): Promise<void> {
  const window = await ensureWindow("palette");
  centerWindowOnActiveDisplay(window);
  window.show();
  window.focus();
  logInfo("window", "Palette shown");
}

async function showLibrary(): Promise<void> {
  const window = await ensureWindow("library");
  window.show();
  window.focus();
  logInfo("window", "Library shown");
}

async function showOnboarding(): Promise<void> {
  const window = await ensureWindow("onboarding");
  window.show();
  window.focus();
  logInfo("window", "Onboarding shown");
}

async function ensureWindow(
  kind: keyof ManagedWindows,
): Promise<BrowserWindow> {
  const existing = windows[kind];
  if (existing && !existing.isDestroyed()) {
    return existing;
  }

  let window: BrowserWindow;

  switch (kind) {
    case "palette":
      window = createPaletteWindow();
      break;
    case "library":
      window = createLibraryWindow();
      break;
    case "onboarding":
      window = createOnboardingWindow();
      break;
    case "tray":
      window = createTrayPopoverWindow();
      break;
  }

  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  attachWindowDiagnostics(kind, window);
  window.on("blur", () => {
    if (kind === "palette" || kind === "tray") {
      logInfo("window", "Transient window hidden on blur", { kind });
      window.hide();
    }
  });
  window.on("closed", () => {
    logInfo("window", "Window closed", { kind });
    windows[kind] = null;
  });

  await loadWindow(window, kind);
  logInfo("window", "Window loaded", {
    kind,
    url: window.webContents.getURL(),
  });
  windows[kind] = window;
  return window;
}

function broadcast(channel: string): void {
  for (const window of Object.values(windows)) {
    if (window && !window.isDestroyed()) {
      window.webContents.send(channel);
    }
  }
}

function createTrayImage() {
  const packagedPath = join(process.resourcesPath, "icons", "trayTemplate.png");
  const devPath = join(__dirname, "../../resources/icons/trayTemplate.png");

  const iconPath = app.isPackaged ? packagedPath : devPath;
  const image = nativeImage.createFromPath(iconPath);
  image.setTemplateImage(true);
  return image;
}

function registerDiagnostics(): void {
  app.on("render-process-gone", (_event, webContents, details) => {
    logError("renderer", "Render process gone", undefined, {
      exitCode: details.exitCode,
      reason: details.reason,
      url: webContents.getURL(),
    });
  });
}

function attachWindowDiagnostics(
  kind: keyof ManagedWindows,
  window: BrowserWindow,
): void {
  const consoleHandler = (
    _event: Electron.Event,
    level: number,
    message: string,
    line: number,
    sourceId: string,
  ): void => {
    const levelLabel = level >= 2 ? "error" : level === 1 ? "warn" : "info";
    const context = {
      kind,
      line,
      sourceId,
      url: window.webContents.getURL(),
    };

    if (levelLabel === "error") {
      logError("console", message, undefined, context);
    } else if (levelLabel === "warn") {
      logWarn("console", message, context);
    } else {
      logInfo("console", message, context);
    }
  };

  const failHandler = (
    _event: Electron.Event,
    errorCode: number,
    errorDescription: string,
    validatedURL: string,
    isMainFrame: boolean,
  ): void => {
    logError("window", "Window failed to load", undefined, {
      errorCode,
      errorDescription,
      isMainFrame,
      kind,
      validatedURL,
    });
  };

  window.webContents.on("console-message", consoleHandler);
  window.webContents.on("did-fail-load", failHandler);

  window.once("closed", () => {
    window.webContents.removeListener("console-message", consoleHandler);
    window.webContents.removeListener("did-fail-load", failHandler);
  });
}

function loggerOrThrow(): DiagnosticLogger {
  if (!logger) {
    throw new Error("Diagnostic logger is not initialized");
  }

  return logger;
}

function logInfo(
  scope: string,
  message: string,
  context?: Record<string, unknown>,
): void {
  console.log(`[quickcommand:${scope}] ${message}`, context ?? "");
  if (logger) {
    void logger.info(scope, message, context);
  }
}

function logWarn(
  scope: string,
  message: string,
  context?: Record<string, unknown>,
): void {
  console.warn(`[quickcommand:${scope}] ${message}`, context ?? "");
  if (logger) {
    void logger.warn(scope, message, context);
  }
}

function logError(
  scope: string,
  message: string,
  error?: unknown,
  context?: Record<string, unknown>,
): void {
  console.error(`[quickcommand:${scope}] ${message}`, error, context ?? "");
  if (logger) {
    void logger.error(scope, message, error, context);
  }
}
