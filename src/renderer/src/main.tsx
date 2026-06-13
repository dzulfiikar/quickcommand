import React from "react";
import ReactDOM from "react-dom/client";

import "./styles.css";

// Resolve a sensible theme before first paint so "system" users on a light
// OS don't see a dark flash. The App overrides this once settings load.
document.documentElement.dataset.theme = window.matchMedia(
  "(prefers-color-scheme: dark)",
).matches
  ? "dark"
  : "light";

// Default palette before settings load. Matches the CSS :root fallback and the
// settings default, so the first paint is valid; the App re-applies once the
// persisted palette loads.
document.documentElement.dataset.palette = "sand";

async function boot() {
  // In browser (non-Electron), load mock preload API for development only
  if (!window.quickCommand && import.meta.env.DEV) {
    await import("./mock-preload");
  }

  const { App } = await import("./App");

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

void boot();
