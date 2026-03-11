import { execFile } from "node:child_process";
import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type HelperCommand =
  | "check-accessibility"
  | "open-accessibility-settings"
  | "paste"
  | "move-left";

export class NativeHelperService {
  async run(command: HelperCommand, ...args: string[]): Promise<string> {
    const executable = await resolveHelperPath();
    const { stdout, stderr } = await execFileAsync(executable, [command, ...args]);

    if (`${stderr}`.trim().length > 0) {
      throw new Error(`${stderr}`.trim());
    }

    return `${stdout}`.trim();
  }
}

async function resolveHelperPath(): Promise<string> {
  const packagedPath = join(
    process.resourcesPath,
    "native",
    "quickcommand-helper",
  );
  const devPath = resolve(process.cwd(), "dist-native", "quickcommand-helper");

  for (const candidate of [packagedPath, devPath]) {
    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Continue until a valid helper is found.
    }
  }

  throw new Error(
    "QuickCommand helper executable was not found. Run `bun run build:helper` before using paste automation.",
  );
}
