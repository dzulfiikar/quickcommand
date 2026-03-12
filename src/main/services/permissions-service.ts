import { systemPreferences } from "electron";
import { NativeHelperService } from "./native-helper-service";

export class PermissionsService {
  constructor(private readonly helper = new NativeHelperService()) {}

  async isAccessibilityTrusted(): Promise<boolean> {
    // Check both the Electron process and the helper binary.
    // The Electron check is faster and doesn't require spawning a process.
    const electronTrusted =
      systemPreferences.isTrustedAccessibilityClient(false);
    if (!electronTrusted) return false;

    // Also verify the helper has permission (it performs the actual paste)
    const result = await this.helper.run("check-accessibility");
    return result === "true";
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
