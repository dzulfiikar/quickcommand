import { describe, expect, test } from "bun:test";

import config from "../../electron.vite.config";
import { preloadBundleFileName } from "../../src/main/windows/shared";

describe("preload packaging", () => {
  test("builds preload as commonjs for packaged electron windows", () => {
    const preloadConfig = config.preload;
    expect(preloadConfig).toBeDefined();
    if (!preloadConfig) {
      throw new Error("Preload config is missing");
    }

    const output = preloadConfig.build?.rollupOptions?.output;
    const normalizedOutput = Array.isArray(output) ? output[0] : output;

    expect(preloadBundleFileName).toBe("index.cjs");
    expect(normalizedOutput?.format).toBe("cjs");
    expect(normalizedOutput?.entryFileNames).toBe("[name].cjs");
  });
});
