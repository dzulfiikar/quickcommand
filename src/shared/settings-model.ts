import { z } from "zod";

export const themeSchema = z.enum(["system", "light", "dark"]);

export type ThemePreference = z.infer<typeof themeSchema>;

/**
 * The color theme (palette) is orthogonal to the light/dark mode above.
 * `theme` decides the mode; `palette` decides which hue family the whole app
 * wears. Each palette ships a calibrated light and dark variant, so the two
 * axes compose: 6 palettes x 3 modes.
 *
 * Palettes are translated from established, documented design systems into the
 * renderer's OKLCH token ladder. "sand" is the original Late-Light Sand look,
 * kept so existing installs never regress.
 */
export const paletteSchema = z.enum([
  "sand",
  "nord",
  "dracula",
  "tokyo-night",
  "gruvbox",
  "solarized",
]);

export type PalettePreference = z.infer<typeof paletteSchema>;

export const settingsSchema = z.object({
  globalShortcut: z.string().nullable(),
  launchAtLogin: z.boolean(),
  pasteRestoreDelayMs: z.number().int().nonnegative(),
  firstRunComplete: z.boolean(),
  showWindowOnStartup: z.boolean(),
  theme: themeSchema,
  palette: paletteSchema,
});

export const defaultSettings = {
  globalShortcut: "CommandOrControl+Alt+Space",
  launchAtLogin: false,
  pasteRestoreDelayMs: 150,
  firstRunComplete: false,
  showWindowOnStartup: false,
  theme: "system",
  palette: "sand",
} satisfies z.input<typeof settingsSchema>;

export type Settings = z.infer<typeof settingsSchema>;
