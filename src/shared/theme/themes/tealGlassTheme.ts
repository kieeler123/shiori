export const tealGlassTheme: Record<string, string> = {
  "--admin-table-wrap-border": "rgba(0,160,150,0.25)",
  "--admin-table-head-bg": "rgba(0,110,105,0.65)",
  "--admin-table-head-fg": "var(--text-5)",
  "--admin-table-row-border": "rgba(0,160,150,0.20)",
  "--admin-table-row-hover": "rgba(0,160,150,0.12)",
  "--admin-table-row-stripe": "rgba(0,160,150,0.05)",
  "--admin-table-row-selected": "rgba(0,160,150,0.18)",
  "--admin-table-focus-ring": "rgba(0,160,150,0.35)",

  "--admin-status-active": "#22c55e",
  "--admin-status-user-trash": "#eab308",
  "--admin-status-admin-trash": "#fb923c",
  "--admin-status-danger": "#ef4444",

  "--admin-btn-bg": "rgba(0,160,150,0.14)",
  "--admin-btn-hover": "rgba(0,160,150,0.20)",
  "--admin-btn-border": "rgba(0,160,150,0.35)",
  "--admin-btn-danger": "rgba(239,68,68,0.20)",

  "--admin-panel-bg": "rgba(0,90,85,0.60)",
  "--admin-panel-border": "rgba(0,160,150,0.20)",
  "--admin-panel-hover": "rgba(0,160,150,0.08)",
  "--admin-panel-muted": "rgba(0,160,150,0.05)",

  "--chart-grid": "rgba(255,255,255,0.06)",
  "--chart-tooltip-bg": "rgba(6,10,12,0.90)",
  "--chart-tooltip-border": "rgba(255,255,255,0.12)",

  "--chart-hover-bg": "rgba(255,255,255,0.06)",
  "--chart-hover-line": "rgba(255,255,255,0.18)",

  "--chart-pie-stroke": "rgba(255,255,255,0.18)",
  "--chart-pie-ring": "rgba(34,211,238,0.16)",

  /* HIGHLIGHT */
  "--hl-title-bg": "rgba(20, 184, 166, 0.20)", // teal
  "--hl-title-fg": "var(--text-2)",
  "--hl-body-bg": "rgba(59, 130, 246, 0.18)", // blue
  "--hl-body-fg": "var(--text-2)",
  "--hl-tag-bg": "rgba(110, 231, 183, 0.16)", // mint
  "--hl-tag-fg": "var(--text-2)",

  "--accent": "#14b8a6", // teal-500
  "--accent-weak": "rgba(20, 184, 166, 0.18)",

  "--text-1": "#f4fbfb",
  "--text-2": "#e8f7f7",
  "--text-3": "#d2eeee",
  "--text-4": "#aacccc",
  "--text-5": "#7fa5a5",
  "--text-6": "#5f7f7f",

  "--bg-app": [
    "radial-gradient(900px circle at 50% -220px, rgba(20,184,166,0.12), transparent 60%)",
    "radial-gradient(700px circle at 10% 18%, rgba(56,189,248,0.06), transparent 55%)",
    "linear-gradient(180deg, #041012 0%, #030b0d 100%)",
  ].join(","),

  "--header-bg": "rgba(6, 18, 20, 0.78)",
  "--header-border": "rgba(255, 255, 255, 0.10)",
  "--header-shadow": "0 10px 30px rgba(0, 0, 0, 0.45)",
  "--header-blur": "10px",

  "--menu-bg": "rgba(18, 30, 32, 0.78)",
  "--menu-border": "rgba(45, 212, 191, 0.25)",
  "--menu-shadow": "0 20px 55px rgba(0, 0, 0, 0.45)",
  "--overlay-bg": "rgba(0, 0, 0, 0.25)",
  "--overlay-blur": "3px",

  "--bg-elev-1": "rgba(10, 24, 26, 0.78)",
  "--bg-elev-2": "rgba(12, 28, 30, 0.82)",
  "--surface-3": "rgba(16, 34, 36, 0.92)",
  "--surface-2": "rgba(10, 24, 26, 0.78)",

  "--border-soft": "rgba(255, 255, 255, 0.08)",
  "--border-strong": "rgba(255, 255, 255, 0.14)",

  "--item-bg": "rgba(12, 28, 30, 0.72)",
  "--item-border": "rgba(255, 255, 255, 0.08)",
  "--item-hover-bg": "rgba(16, 34, 36, 0.82)",
  "--item-hover-border": "rgba(255, 255, 255, 0.14)",
  "--item-hover-shadow": "0 12px 35px rgba(0, 0, 0, 0.35)",
  "--item-active-scale": "0.995",

  "--field-bg": "rgba(12, 28, 30, 0.78)",
  "--field-border": "rgba(255, 255, 255, 0.10)",
  "--field-focus-border": "rgba(20, 184, 166, 0.55)",
  "--field-placeholder": "rgba(127, 165, 165, 0.72)",

  "--ring": "rgba(20, 184, 166, 0.34)",

  "--btn-primary-bg": "#e8f7f7",
  "--btn-primary-fg": "#041012",
  "--btn-primary-border": "rgba(232,247,247,0.55)",
  "--btn-primary-hover-bg": "#ffffff",

  "--btn-secondary-bg": "rgba(12, 28, 30, 0.78)",
  "--btn-secondary-fg": "var(--text-3)",
  "--btn-secondary-border": "rgba(255,255,255,0.10)",
  "--btn-secondary-hover-bg": "rgba(16, 34, 36, 0.88)",

  "--btn-ghost-fg": "var(--text-3)",
  "--btn-ghost-hover-fg": "var(--text-2)",
  "--btn-ghost-hover-bg": "rgba(255,255,255,0.05)",

  "--btn-outline-border": "rgba(255,255,255,0.10)",
  "--btn-outline-fg": "var(--text-3)",
  "--btn-outline-hover-bg": "rgba(255,255,255,0.05)",

  "--btn-danger-border": "rgba(239, 68, 68, 0.42)",
  "--btn-danger-fg": "#fca5a5",
  "--btn-danger-hover-bg": "rgba(239, 68, 68, 0.14)",

  "--btn-soft-hover-bg": "rgba(255,255,255,0.05)",

  "--btn-icon-fg": "var(--text-3)",
  "--btn-icon-hover-fg": "var(--text-2)",
  "--btn-icon-hover-bg": "rgba(255,255,255,0.06)",

  "--editor-bg": "var(--bg-elev-1)",
  "--editor-border": "var(--border-soft)",

  "--userchip-bg": "rgba(12, 28, 30, 0.60)",
  "--userchip-hover-bg": "rgba(16, 34, 36, 0.82)",
  "--userchip-border": "rgba(255,255,255,0.10)",
  "--userchip-avatar-bg": "rgba(10,24,26,0.85)",
  "--userchip-text": "var(--text-3)",
  "--userchip-subtext": "var(--text-6)",
};
