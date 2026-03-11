import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const preloadBundleFileName = "index.cjs";

export function getPreloadPath(importMetaUrl: string): string {
  const currentDir = dirname(fileURLToPath(importMetaUrl));
  return join(currentDir, "../preload", preloadBundleFileName);
}
