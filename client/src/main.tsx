import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./dofinity-bold.css";
import { initializeFonts } from "./lib/fontStorage";
import { injectGlobalFontStyles } from "./lib/injectFontStyles";

// Initialize custom and Google fonts
initializeFonts();
injectGlobalFontStyles();

createRoot(document.getElementById("root")!).render(<App />);
