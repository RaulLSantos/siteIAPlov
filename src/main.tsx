import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("[app] entry loaded", { env: import.meta.env });

createRoot(document.getElementById("root")!).render(<App />);
