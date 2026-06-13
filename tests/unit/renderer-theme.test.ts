import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("renderer theme", () => {
  test("keeps the tonal ladder and respects reduced motion", async () => {
    const source = await readFile(
      new URL("../../src/renderer/src/styles.css", import.meta.url),
      "utf8",
    );

    expect(source).toContain(".surface");
    expect(source).toContain("--surface-1");
    expect(source).toContain("--surface-2");
    expect(source).toContain("--surface-3");
    expect(source).toContain("prefers-reduced-motion");
  });

  test("uses calibrated elevation tokens for depth", async () => {
    const source = await readFile(
      new URL("../../src/renderer/src/styles.css", import.meta.url),
      "utf8",
    );

    // "Loupe, refined" replaces the old flat-only rule with a layered
    // elevation system. The tokens must exist and the base surface uses one.
    expect(source).toContain("--elevation-1");
    expect(source).toContain("--elevation-2");
    expect(source).toContain("--elevation-float");
    expect(source).toMatch(
      /\.surface\s*\{[^}]*box-shadow:\s*var\(--elevation-2\)/,
    );
  });

  test("scopes translucency to floating overlays only", async () => {
    const source = await readFile(
      new URL("../../src/renderer/src/styles.css", import.meta.url),
      "utf8",
    );

    // Glass belongs on .surface-float (palette/tray sit over other apps),
    // and must ship the -webkit- prefix for the Electron/WebKit renderer.
    expect(source).toContain(".surface-float");
    expect(source).toContain("backdrop-filter");
    expect(source).toContain("-webkit-backdrop-filter");

    // The base .surface block itself must NOT be translucent — only the
    // float variant is. Guard against blur leaking onto the solid surface.
    const baseSurface = source.match(/\.surface\s*\{[^}]*\}/)?.[0] ?? "";
    expect(baseSurface).not.toContain("backdrop-filter");
  });

  test("defines both light and dark themes with the core tokens", async () => {
    const source = await readFile(
      new URL("../../src/renderer/src/styles.css", import.meta.url),
      "utf8",
    );

    expect(source).toContain('[data-theme="dark"]');
    expect(source).toContain('[data-theme="light"]');

    // The sand light theme is now declared via a selector list
    // (`:root[data-theme="light"], :root[data-palette="sand"][data-theme="light"]`),
    // so match the rule whose selector list contains the bare light selector
    // and capture its body.
    const lightBlock =
      source.match(
        /:root\[data-theme="light"\][^{]*\{([^}]*color-scheme:\s*light[^}]*)\}/,
      )?.[0] ?? "";
    // Light theme must declare its own base surfaces, foreground, and the
    // shared accent — otherwise it would fall back to dark values.
    for (const token of [
      "--background",
      "--foreground",
      "--surface-2",
      "--primary",
      "--ring",
    ]) {
      expect(lightBlock).toContain(token);
    }
    // Light surfaces are pale (lightness well above mid) so the inverted
    // theme is real, not a tinted-dark fake.
    expect(lightBlock).toMatch(/--background:\s*oklch\(0\.9/);
    expect(lightBlock).toContain("color-scheme: light");
  });

  test("ships every color theme with a light and a dark variant", async () => {
    const source = await readFile(
      new URL("../../src/renderer/src/styles.css", import.meta.url),
      "utf8",
    );

    // Each palette is an independent, full token package, not a tint over the
    // default. Both modes must declare their own base surfaces + accent so a
    // palette never silently falls back to another palette's values.
    const palettes = [
      "sand",
      "nord",
      "dracula",
      "tokyo-night",
      "gruvbox",
      "solarized",
    ];

    for (const palette of palettes) {
      const dark = source.includes(`[data-palette="${palette}"]`);
      const light = source.includes(
        `[data-palette="${palette}"][data-theme="light"]`,
      );
      expect(dark).toBe(true);
      expect(light).toBe(true);
    }
  });

  test("locks each palette's accent hue family across light and dark", async () => {
    const source = await readFile(
      new URL("../../src/renderer/src/styles.css", import.meta.url),
      "utf8",
    );

    // Per-palette Color Consistency Lock: within one palette the accent keeps
    // a single hue family across both modes; only lightness/chroma shift. The
    // hue must stay within a tight band so e.g. Nord never drifts off blue.
    // Each palette's expected hue and the tolerance band (in OKLCH degrees).
    const expectedHue: Record<string, number> = {
      sand: 74,
      nord: 228,
      dracula: 300,
      "tokyo-night": 263,
      gruvbox: 48,
      solarized: 246,
    };
    const tolerance = 22;

    for (const [palette, hue] of Object.entries(expectedHue)) {
      // Grab every block scoped to this palette and pull its --primary hues.
      const blocks = [
        ...source.matchAll(
          new RegExp(
            `\\[data-palette="${palette}"\\][^{]*\\{[^}]*?--primary:\\s*oklch\\(([^)]*)\\)`,
            "g",
          ),
        ),
      ];
      expect(blocks.length).toBeGreaterThanOrEqual(2);
      for (const block of blocks) {
        const parts = block[1].trim().split(/\s+/);
        const primaryHue = Number(parts[2]);
        expect(Math.abs(primaryHue - hue)).toBeLessThanOrEqual(tolerance);
      }
    }
  });
});
