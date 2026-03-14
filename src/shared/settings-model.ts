import { z } from "zod";

export const settingsSchema = z.object({
  globalShortcut: z.string().nullable(),
  launchAtLogin: z.boolean(),
  pasteRestoreDelayMs: z.number().int().nonnegative(),
  firstRunComplete: z.boolean(),
  showWindowOnStartup: z.boolean(),
});

export const defaultSettings = {
  globalShortcut: "CommandOrControl+Alt+Space",
  launchAtLogin: false,
  pasteRestoreDelayMs: 150,
  firstRunComplete: false,
  showWindowOnStartup: false,
} satisfies z.input<typeof settingsSchema>;

export type Settings = z.infer<typeof settingsSchema>;
