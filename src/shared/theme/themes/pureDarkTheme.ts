// pureDarkTheme.ts
export const pureDarkTheme: Record<string, string> = {
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
