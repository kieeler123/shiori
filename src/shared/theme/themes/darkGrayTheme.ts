// darkGrayTheme.ts
export const darkGrayTheme: Record<string, string> = {
  "--admin-table-wrap-border": "rgba(255,255,255,0.12)",
  "--admin-table-head-bg": "rgba(30,30,30,0.70)",
  "--admin-table-head-fg": "var(--text-5)",
  "--admin-table-row-border": "rgba(255,255,255,0.07)",
  "--admin-table-row-hover": "rgba(255,255,255,0.05)",
  "--admin-table-row-stripe": "rgba(255,255,255,0.02)",
  "--admin-table-row-selected": "rgba(255,255,255,0.08)",
  "--admin-table-focus-ring": "rgba(255,255,255,0.25)",

  "--admin-status-active": "#22c55e",
  "--admin-status-user-trash": "#eab308",
  "--admin-status-admin-trash": "#f97316",
  "--admin-status-danger": "#ef4444",

  "--admin-btn-bg": "rgba(255,255,255,0.06)",
  "--admin-btn-hover": "rgba(255,255,255,0.10)",
  "--admin-btn-border": "rgba(255,255,255,0.18)",
  "--admin-btn-danger": "rgba(239,68,68,0.20)",

  "--admin-panel-bg": "rgba(30,30,30,0.60)",
  "--admin-panel-border": "rgba(255,255,255,0.10)",
  "--admin-panel-hover": "rgba(255,255,255,0.04)",
  "--admin-panel-muted": "rgba(255,255,255,0.03)",

  "--chart-1": "#60a5fa", // blue
  "--chart-2": "#34d399", // emerald
  "--chart-3": "#fbbf24", // amber

  "--chart-grid": "rgba(255,255,255,0.06)",
  "--chart-tooltip-bg": "rgba(12,12,12,0.92)",
  "--chart-tooltip-border": "rgba(255,255,255,0.12)",

  "--chart-hover-bg": "rgba(255,255,255,0.06)",
  "--chart-hover-line": "rgba(255,255,255,0.18)",

  "--chart-pie-stroke": "rgba(255,255,255,0.18)",
  "--chart-pie-ring": "rgba(96,165,250,0.16)",

  /* HIGHLIGHT */
  "--hl-title-bg": "rgba(148, 163, 184, 0.18)",
  "--hl-title-fg": "var(--text-2)",
  "--hl-body-bg": "rgba(244, 114, 182, 0.16)",
  "--hl-body-fg": "var(--text-2)",
  "--hl-tag-bg": "rgba(56, 189, 248, 0.16)",
  "--hl-tag-fg": "var(--text-2)",

  "--accent": "#22d3ee", // cyan-400
  "--accent-weak": "rgba(34, 211, 238, 0.18)",
  /* TEXT */
  "--text-1": "#f5f5f5",
  "--text-2": "#e5e5e5",
  "--text-3": "#d4d4d4",
  "--text-4": "#a3a3a3",
  "--text-5": "#737373",
  "--text-6": "#525252",

  /* APP BACKGROUND */
  "--bg-app": `
    radial-gradient(
      900px circle at 50% -220px,
      rgba(255,255,255,0.04),
      transparent 60%
    ),
    linear-gradient(180deg, #0f0f11 0%, #0a0a0c 100%)
  `,

  /* HEADER */
  "--header-bg": "rgba(24, 24, 27, 0.78)",
  "--header-border": "rgba(255, 255, 255, 0.10)",
  "--header-shadow": "0 10px 30px rgba(0, 0, 0, 0.4)",
  "--header-blur": "10px",

  /* MENU */
  "--menu-bg": "rgba(24, 24, 27, 0.92)",
  "--menu-border": "rgba(255,255,255,0.08)",
  "--menu-shadow": "0 20px 60px rgba(0,0,0,0.55)",
  "--menu-blur": "10px",

  "--menu-item-fg": "var(--text-3)",
  "--menu-item-hover-fg": "var(--text-1)",
  "--menu-item-hover-bg": "rgba(255,255,255,0.05)",

  /* LOGIN / NAV BUTTON */
  "--btn-nav-bg": "rgba(40,40,40,0.6)",
  "--btn-nav-fg": "var(--text-3)",
  "--btn-nav-border": "rgba(255,255,255,0.08)",
  "--btn-nav-hover-bg": "rgba(50,50,50,0.9)",
  "--btn-nav-hover-border": "rgba(255,255,255,0.14)",

  /* USER CHIP */
  "--userchip-bg": "rgba(40,40,40,0.55)",
  "--userchip-hover-bg": "rgba(55,55,55,0.9)",
  "--userchip-border": "rgba(255,255,255,0.08)",
  "--userchip-avatar-bg": "rgba(30,30,30,0.85)",
  "--userchip-text": "var(--text-3)",
  "--userchip-subtext": "var(--text-6)",

  /* OVERLAY */
  "--overlay-bg": "rgba(0,0,0,0.35)",
  "--overlay-blur": "3px",

  /* SURFACE */
  "--bg-elev-1": "rgba(24, 24, 27, 0.85)",
  "--bg-elev-2": "rgba(24, 24, 27, 0.75)",
  "--surface-3": "rgba(30, 30, 30, 0.95)",
  "--surface-2": "rgba(24, 24, 27, 0.8)",

  /* BORDERS */
  "--border-soft": "rgba(255,255,255,0.06)",
  "--border-strong": "rgba(255,255,255,0.12)",

  /* LIST ITEM */
  "--item-bg": "rgba(24, 24, 27, 0.7)",
  "--item-border": "rgba(255,255,255,0.08)",
  "--item-hover-bg": "rgba(40, 40, 40, 0.8)",
  "--item-hover-border": "rgba(255,255,255,0.12)",
  "--item-hover-shadow": "0 10px 30px rgba(0,0,0,0.45)",
  "--item-active-scale": "0.995",

  /* FIELD */
  "--field-bg": "rgba(30,30,30,0.8)",
  "--field-border": "rgba(255,255,255,0.08)",
  "--field-focus-border": "rgba(200,200,200,0.35)",
  "--field-placeholder": "rgba(150,150,150,0.7)",

  /* BUTTON - Primary */
  "--btn-primary-bg": "#e5e5e5",
  "--btn-primary-fg": "#111111",
  "--btn-primary-border": "rgba(255,255,255,0.4)",
  "--btn-primary-hover-bg": "#ffffff",

  /* BUTTON - Secondary */
  "--btn-secondary-bg": "rgba(40,40,40,0.7)",
  "--btn-secondary-fg": "var(--text-3)",
  "--btn-secondary-border": "rgba(255,255,255,0.08)",
  "--btn-secondary-hover-bg": "rgba(50,50,50,0.9)",

  /* BUTTON - Ghost */
  "--btn-ghost-fg": "var(--text-3)",
  "--btn-ghost-hover-fg": "var(--text-1)",
  "--btn-ghost-hover-bg": "rgba(255,255,255,0.04)",

  /* BUTTON - Outline */
  "--btn-outline-border": "rgba(255,255,255,0.08)",
  "--btn-outline-fg": "var(--text-3)",
  "--btn-outline-hover-bg": "rgba(255,255,255,0.04)",

  /* BUTTON - Danger */
  "--btn-danger-border": "rgba(239,68,68,0.4)",
  "--btn-danger-fg": "#fca5a5",
  "--btn-danger-hover-bg": "rgba(239,68,68,0.12)",

  /* FOCUS RING */
  "--ring": "rgba(200,200,200,0.3)",
  "--tw-ring-color": "var(--ring)",

  "--editor-bg": "var(--bg-elev-1)",
  "--editor-border": "var(--border-soft)",
};
