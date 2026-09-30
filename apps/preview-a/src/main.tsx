import "@cloudscape-design/global-styles/index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App.js";
import { getBackend } from "./backend.js";

const container = document.getElementById("root");
if (container === null) {
  throw new Error("Root container #root not found");
}

createRoot(container).render(
  <StrictMode>
    <App adapter={getBackend()} />
  </StrictMode>,
);
