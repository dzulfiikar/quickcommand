import { ipcMain } from "electron";
import type { DiagnosticLogger } from "../services/diagnostic-logger";
import { channels } from "./channels";

export function registerDiagnosticHandlers(logger: DiagnosticLogger): void {
  ipcMain.on(channels.diagnosticsLog, (_event, payload: unknown) => {
    void logger.error("renderer", "Renderer reported an error", undefined, {
      payload,
    });
  });
}
