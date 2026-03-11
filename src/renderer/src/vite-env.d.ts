/// <reference types="vite/client" />

import type { QuickCommandAPI } from "../../shared/app-api";

declare global {
  interface Window {
    quickCommand: QuickCommandAPI;
  }
}
