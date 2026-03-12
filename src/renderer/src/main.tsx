import React from "react";
import ReactDOM from "react-dom/client";

import "./styles.css";

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
