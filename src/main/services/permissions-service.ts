import { systemPreferences } from "electron";
import { NativeHelperService } from "./native-helper-service";

export class PermissionsService {
  constructor(private readonly helper = new NativeHelperService()) {}

  async isAccessibilityTrusted(): Promise<boolean> {
    // Accessibility is granted to the *app*, and child processes inherit the
    // app's TCC authorization via the macOS "responsible process" model. So the
    // app-level check is the authoritative signal that the user granted access.
    //
    // We deliberately do NOT also require the helper's own AXIsProcessTrusted()
    // here: the helper is a separate executable spawned per command, and a
    // standalone `check-accessibility` invocation reports the helper's *own*
    // identity, which is not in the Accessibility list even when the app is
    // trusted. Gating on it made paste impossible despite the user granting
    // QuickCommand access. The real paste invocation (performPaste) still guards
    // with AXIsProcessTrusted() and surfaces a helper failure if it ever lacks
    // permission, so enforcement is preserved without the false negative.
    return systemPreferences.isTrustedAccessibilityClient(false);
  }

  async promptAccessibility(): Promise<boolean> {
    // Prompt for the Electron process first (this is the main app the user sees)
    systemPreferences.isTrustedAccessibilityClient(true);

    // Then prompt for the helper binary
    const result = await this.helper.run("prompt-accessibility");
    return result === "true";
  }

  async openAccessibilitySettings(): Promise<void> {
    await this.helper.run("open-accessibility-settings");
  }
}
