import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export type DiagnosticContext = Record<string, unknown>;
export type DiagnosticLevel = "info" | "warn" | "error";

type DiagnosticError = {
  message: string;
  name: string;
  stack?: string;
};

type DiagnosticEntry = {
  context?: DiagnosticContext;
  error?: DiagnosticError;
  level: DiagnosticLevel;
  message: string;
  scope: string;
  timestamp: string;
};

export class DiagnosticLogger {
  constructor(private readonly logFilePath: string) {}

  getLogFilePath(): string {
    return this.logFilePath;
  }

  async info(
    scope: string,
    message: string,
    context?: DiagnosticContext,
  ): Promise<void> {
    await this.write({
      context,
      level: "info",
      message,
      scope,
      timestamp: new Date().toISOString(),
    });
  }

  async warn(
    scope: string,
    message: string,
    context?: DiagnosticContext,
  ): Promise<void> {
    await this.write({
      context,
      level: "warn",
      message,
      scope,
      timestamp: new Date().toISOString(),
    });
  }

  async error(
    scope: string,
    message: string,
    error?: unknown,
    context?: DiagnosticContext,
  ): Promise<void> {
    await this.write({
      context,
      error: serializeError(error),
      level: "error",
      message,
      scope,
      timestamp: new Date().toISOString(),
    });
  }

  private async write(entry: DiagnosticEntry): Promise<void> {
    await mkdir(dirname(this.logFilePath), { recursive: true });
    await appendFile(this.logFilePath, `${JSON.stringify(entry)}\n`, "utf8");
  }
}

function serializeError(error: unknown): DiagnosticError | undefined {
  if (!error) {
    return undefined;
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
    name: typeof error,
  };
}
