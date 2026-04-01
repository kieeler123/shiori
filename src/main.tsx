import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./app/App";
import { SessionProvider } from "@/features/auth/SessionProvider";
import ThemeProvider from "./shared/theme/ThemeProvider";
import { initThemeName } from "./shared/theme/theme.storage";

import "./index.css"; // ✅ 먼저
import "@/shared/theme/theme.css"; // ✅ 항상 가장 마지막(테마가 최종 승자)
import { LocaleProvider } from "./shared/i18n/LocaleProvider";
import AppErrorBoundary from "./shared/error/AppErrorBoundary";
import { logError } from "./shared/error/logError";

initThemeName();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SessionProvider>
      <BrowserRouter>
        <ThemeProvider>
          <LocaleProvider>
            <AppErrorBoundary>
              <App />
            </AppErrorBoundary>
          </LocaleProvider>
        </ThemeProvider>
      </BrowserRouter>
    </SessionProvider>
  </React.StrictMode>,
);

window.addEventListener("error", (event) => {
  logError({
    category: "render",
    action: "window-error",
    page: window.location.pathname,
    error: event.error,
    meta: {
      message: event.message,
    },
  });
});

window.addEventListener("unhandledrejection", (event) => {
  logError({
    category: "network",
    action: "unhandled-promise",
    page: window.location.pathname,
    error: event.reason,
  });
});
