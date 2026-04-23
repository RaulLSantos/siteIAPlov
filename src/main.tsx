import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("[app] entry loaded", { env: import.meta.env });

const renderApp = () => {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error('React root element "#root" was not found in index.html.');
  }

  createRoot(rootElement).render(<App />);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderApp, { once: true });
} else {
  renderApp();
}
