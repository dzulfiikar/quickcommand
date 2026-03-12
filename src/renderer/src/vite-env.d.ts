/// <reference types="vite/client" />

import type { QuickCommandAPI } from "../../shared/app-api";

declare global {
  const __APP_VERSION__: string;

  interface Window {
    quickCommand: QuickCommandAPI;
  }
}
