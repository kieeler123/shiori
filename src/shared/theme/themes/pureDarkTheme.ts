// pureDarkTheme.ts
export const pureDarkTheme: Record<string, string> = {
  "--admin-table-wrap-border": "rgba(140,80,160,0.25)",
  "--admin-table-head-bg": "rgba(90,50,110,0.65)",
  "--admin-table-head-fg": "var(--text-5)",
  "--admin-table-row-border": "rgba(140,80,160,0.20)",
  "--admin-table-row-hover": "rgba(140,80,160,0.12)",
  "--admin-table-row-stripe": "rgba(140,80,160,0.05)",
  "--admin-table-row-selected": "rgba(140,80,160,0.18)",
  "--admin-table-focus-ring": "rgba(140,80,160,0.35)",

  "--admin-status-active": "#4ade80",
  "--admin-status-user-trash": "#facc15",
  "--admin-status-admin-trash": "#fb923c",
  "--admin-status-danger": "#ef4444",

  "--admin-btn-bg": "rgba(140,80,160,0.14)",
  "--admin-btn-hover": "rgba(140,80,160,0.20)",
  "--admin-btn-border": "rgba(140,80,160,0.35)",
  "--admin-btn-danger": "rgba(239,68,68,0.20)",

  "--admin-panel-bg": "rgba(70,40,90,0.60)",
  "--admin-panel-border": "rgba(140,80,160,0.20)",
  "--admin-panel-hover": "rgba(140,80,160,0.08)",
  "--admin-panel-muted": "rgba(140,80,160,0.05)",

  "--chart-1": "#a78bfa", // violet
  "--chart-2": "#22d3ee", // cyan
  "--chart-3": "#fb7185", // pink

  "--chart-grid": "rgba(255,255,255,0.05)",
  "--chart-tooltip-bg": "rgba(0,0,0,0.92)",
  "--chart-tooltip-border": "rgba(255,255,255,0.10)",

  "--chart-hover-bg": "rgba(255,255,255,0.05)",
  "--chart-hover-line": "rgba(255,255,255,0.16)",

  "--chart-pie-stroke": "rgba(255,255,255,0.16)",
  "--chart-pie-ring": "rgba(167,139,250,0.16)",

  /* HIGHLIGHT */
  "--hl-title-bg": "rgba(244, 244, 245, 0.16)",
  "--hl-title-fg": "var(--text-2)",
  "--hl-body-bg": "rgba(34, 197, 94, 0.18)",
  "--hl-body-fg": "var(--text-2)",
  "--hl-tag-bg": "rgba(245, 158, 11, 0.18)",
  "--hl-tag-fg": "var(--text-2)",

  "--accent": "#60a5fa", // blue-400
  "--accent-weak": "rgba(96, 165, 250, 0.20)",
  /* TEXT */
  "--text-1": "#ffffff",
  "--text-2": "#e5e5e5",
  "--text-3": "#cfcfcf",
  "--text-4": "#a3a3a3",
  "--text-5": "#737373",
  "--text-6": "#525252",

  /* HEADER */
  "--header-bg": "rgba(0, 0, 0, 0.85)",
  "--header-border": "rgba(255, 255, 255, 0.08)",
  "--header-shadow": "0 10px 30px rgba(0,0,0,0.6)",
  "--header-blur": "8px",

  /* APP BG */
  "--bg-app": `
    radial-gradient(900px circle at 50% -240px, rgba(255,255,255,0.05), transparent 60%),
    linear-gradient(180deg, #000000 0%, #050505 100%)
  `,

  /* =========================
     MENU
     ========================= */
  "--menu-bg": "rgba(8, 8, 8, 0.95)",
  "--menu-border": "rgba(255,255,255,0.06)",
  "--menu-shadow": "0 25px 65px rgba(0,0,0,0.75)",
  "--menu-blur": "6px",

  "--menu-item-fg": "var(--text-3)",
  "--menu-item-hover-fg": "#ffffff",
  "--menu-item-hover-bg": "rgba(255,255,255,0.06)",

  /* =========================
     LOGIN / NAV BUTTON
     ========================= */
  "--btn-nav-bg": "rgba(25,25,25,0.9)",
  "--btn-nav-fg": "var(--text-3)",
  "--btn-nav-border": "rgba(255,255,255,0.06)",
  "--btn-nav-hover-bg": "rgba(40,40,40,1)",
  "--btn-nav-hover-border": "rgba(255,255,255,0.14)",

  /* =========================
     USER CHIP
     ========================= */
  "--userchip-bg": "rgba(25,25,25,0.85)",
  "--userchip-hover-bg": "rgba(40,40,40,1)",
  "--userchip-border": "rgba(255,255,255,0.06)",
  "--userchip-avatar-bg": "rgba(15,15,15,1)",
  "--userchip-text": "var(--text-3)",
  "--userchip-subtext": "var(--text-6)",

  /* =========================
     OVERLAY
     ========================= */
  "--overlay-bg": "rgba(0,0,0,0.45)",
  "--overlay-blur": "3px",

  /* SURFACE */
  "--bg-elev-1": "rgba(10, 10, 10, 0.92)",
  "--bg-elev-2": "rgba(15, 15, 15, 0.88)",
  "--surface-3": "rgba(22, 22, 22, 0.96)",
  "--surface-2": "rgba(14, 14, 14, 0.92)",

  /* BORDERS */
  "--border-soft": "rgba(255,255,255,0.05)",
  "--border-strong": "rgba(255,255,255,0.10)",

  /* LIST ITEM */
  "--item-bg": "rgba(16, 16, 16, 0.88)",
  "--item-border": "rgba(255,255,255,0.14)",
  "--item-hover-bg": "rgba(26, 26, 26, 0.1)",
  "--item-hover-border": "rgba(255,255,255,0.22)",
  "--item-hover-shadow": "0 10px 30px rgba(0,0,0,0.55)",
  "--item-active-scale": "0.995",

  /* FIELD */
  "--field-bg": "rgba(20, 20, 20, 0.95)",
  "--field-border": "rgba(255,255,255,0.06)",
  "--field-focus-border": "rgba(255,255,255,0.22)",
  "--field-placeholder": "rgba(120,120,120,0.70)",

  /* BUTTON */
  "--btn-primary-bg": "#ffffff",
  "--btn-primary-fg": "#000000",
  "--btn-primary-border": "rgba(255,255,255,0.60)",
  "--btn-primary-hover-bg": "#f4f4f5",

  "--btn-secondary-bg": "rgba(30,30,30,0.90)",
  "--btn-secondary-fg": "var(--text-3)",
  "--btn-secondary-border": "rgba(255,255,255,0.06)",
  "--btn-secondary-hover-bg": "rgba(45,45,45,1)",

  "--btn-ghost-fg": "var(--text-3)",
  "--btn-ghost-hover-fg": "#ffffff",
  "--btn-ghost-hover-bg": "rgba(255,255,255,0.05)",

  "--btn-outline-border": "rgba(255,255,255,0.06)",
  "--btn-outline-fg": "var(--text-3)",
  "--btn-outline-hover-bg": "rgba(255,255,255,0.05)",

  "--btn-danger-border": "rgba(239,68,68,0.40)",
  "--btn-danger-fg": "#fca5a5",
  "--btn-danger-hover-bg": "rgba(239,68,68,0.15)",

  /* FOCUS RING */
  "--ring": "rgba(255,255,255,0.22)",
  "--tw-ring-color": "var(--ring)",

  "--editor-bg": "var(--bg-elev-1)",
  "--editor-border": "var(--border-soft)",
};
