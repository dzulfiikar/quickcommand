import { NativeHelperService } from "./native-helper-service";

export class PermissionsService {
  constructor(private readonly helper = new NativeHelperService()) {}

  async isAccessibilityTrusted(): Promise<boolean> {
    const result = await this.helper.run("check-accessibility");
    return result === "true";
  }

  async openAccessibilitySettings(): Promise<void> {
    await this.helper.run("open-accessibility-settings");
  }
}
