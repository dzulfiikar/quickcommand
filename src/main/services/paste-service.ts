import { clipboard } from "electron";

import { NativeHelperService } from "./native-helper-service";

type ClipboardSnapshot = {
  formats: string[];
  buffers: Map<string, Buffer>;
};

export class PasteService {
  constructor(private readonly helper = new NativeHelperService()) {}

  async insertText(text: string, restoreDelayMs: number): Promise<void> {
    const snapshot = captureClipboardState();

    try {
      clipboard.clear();
      clipboard.writeText(text);
      await delay(70);
      await this.helper.run("paste");
    } finally {
      await delay(restoreDelayMs);
      restoreClipboardState(snapshot);
    }
  }
}

function captureClipboardState(): ClipboardSnapshot {
  const formats = clipboard.availableFormats();
  const buffers = new Map<string, Buffer>();

  for (const format of formats) {
    try {
      buffers.set(format, clipboard.readBuffer(format));
    } catch {
      // Ignore unreadable formats and restore the formats that Electron can handle.
    }
  }

  if (formats.length === 0) {
    buffers.set("text/plain", Buffer.from(clipboard.readText(), "utf8"));
  }

  return { formats, buffers };
}

function restoreClipboardState(snapshot: ClipboardSnapshot): void {
  clipboard.clear();

  if (snapshot.buffers.size === 0) {
    return;
  }

  for (const [format, buffer] of snapshot.buffers.entries()) {
    clipboard.writeBuffer(format, buffer);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
