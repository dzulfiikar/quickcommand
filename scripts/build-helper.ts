import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const projectRoot = process.cwd();
const sourcePath = resolve(
  projectRoot,
  "native/quickcommand-helper/Sources/QuickCommandHelper/main.swift",
);
const outputPath = resolve(projectRoot, "dist-native/quickcommand-helper");

await mkdir(dirname(outputPath), { recursive: true });

const result = Bun.spawnSync(
  [
    "swiftc",
    "-O",
    sourcePath,
    "-framework",
    "AppKit",
    "-framework",
    "ApplicationServices",
    "-o",
    outputPath,
  ],
  {
    cwd: projectRoot,
    stderr: "pipe",
    stdout: "pipe",
  },
);

if (result.exitCode !== 0) {
  throw new Error(
    `Swift helper build failed.\n${result.stderr.toString() || result.stdout.toString()}`,
  );
}

console.log(`Built helper at ${outputPath}`);
