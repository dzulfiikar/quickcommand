import { app } from "electron";

export class AutostartService {
  apply(enabled: boolean): void {
    app.setLoginItemSettings({
      openAtLogin: enabled,
    });
  }
}
