import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import { SessionProvider } from "@/features/auth/SessionProvider";
import "./index.css";
import ThemeProvider from "./shared/theme/ThemeProvider";
import { initThemeName } from "./shared/theme/theme.storage";
import "@/shared/theme/theme.css";

initThemeName();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SessionProvider>
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </SessionProvider>
  </React.StrictMode>,
);
