import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { DiagnosticLogger } from "../../src/main/services/diagnostic-logger";

describe("DiagnosticLogger", () => {
  let tempDir: string;
  let logPath: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "quickcommand-logs-"));
    logPath = join(tempDir, "quickcommand.log");
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  test("writes structured log lines to disk", async () => {
    const logger = new DiagnosticLogger(logPath);

    await logger.info("bootstrap", "app started", { version: "0.1.0" });

    const raw = await readFile(logPath, "utf8");
    const line = JSON.parse(raw.trim()) as Record<string, unknown>;

    expect(line.level).toBe("info");
    expect(line.scope).toBe("bootstrap");
    expect(line.message).toBe("app started");
    expect(line.context).toEqual({ version: "0.1.0" });
  });

  test("serializes error details when logging failures", async () => {
    const logger = new DiagnosticLogger(logPath);

    await logger.error("renderer", "window crashed", new Error("boom"), {
      window: "onboarding",
    });

    const raw = await readFile(logPath, "utf8");
    const line = JSON.parse(raw.trim()) as Record<string, unknown>;
    const error = line.error as Record<string, unknown>;

    expect(line.level).toBe("error");
    expect(error.message).toBe("boom");
    expect(error.name).toBe("Error");
  });
});
