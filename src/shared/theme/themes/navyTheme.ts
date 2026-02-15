export const navyTheme = {
  /* TEXT */
  "--text-1": "#fafafa",
  "--text-2": "#f4f4f5",
  "--text-3": "#e4e4e7",
  "--text-4": "#d4d4d8",
  "--text-5": "#a1a1aa",
  "--text-6": "#71717a",

  /* HEADER */
  "--header-bg": "rgba(17, 24, 39, 0.72)",
  "--header-border": "rgba(255, 255, 255, 0.12)",
  "--header-shadow": "0 10px 30px rgba(0, 0, 0, 0.35)",
  "--header-blur": "10px",

  /* MENU */
  "--menu-bg": "rgba(10, 14, 28, 0.88)",
  "--menu-border": "rgba(255, 255, 255, 0.10)",
  "--menu-shadow": "0 20px 60px rgba(0, 0, 0, 0.35)",
  "--menu-blur": "10px",

  "--menu-item-fg": "var(--text-3)",
  "--menu-item-hover-bg": "rgba(255, 255, 255, 0.05)",
  "--menu-item-hover-fg": "var(--text-2)",

  /* LOGIN / HEADER BUTTON (nav/userchip 계열) */
  "--btn-nav-bg": "rgba(17, 24, 39, 0.40)",
  "--btn-nav-fg": "var(--text-3)",
  "--btn-nav-border": "rgba(255, 255, 255, 0.12)",
  "--btn-nav-hover-bg": "rgba(17, 24, 39, 0.60)",
  "--btn-nav-hover-border": "rgba(255, 255, 255, 0.20)",

  "--userchip-bg": "rgba(17, 24, 39, 0.45)",
  "--userchip-hover-bg": "rgba(17, 24, 39, 0.65)",
  "--userchip-border": "rgba(255, 255, 255, 0.08)",
  "--userchip-avatar-bg": "rgba(17, 24, 39, 0.60)",
  "--userchip-text": "var(--text-3)",
  "--userchip-subtext": "var(--text-6)",

  /* OVERLAY (메뉴 뒤 배경) */
  "--overlay-bg": "rgba(0, 0, 0, 0.28)",
  "--overlay-blur": "3px",

  /* SURFACE */
  "--bg-elev-1": "rgba(17, 24, 39, 0.75)",
  "--bg-elev-2": "rgba(17, 24, 39, 0.75)",
  "--surface-3": "rgba(24, 30, 45, 0.9)",
  "--surface-2": "rgba(17, 24, 39, 0.72)",

  /* BORDERS */
  "--border-soft": "rgba(255, 255, 255, 0.08)",
  "--border-strong": "rgba(255, 255, 255, 0.12)",

  /* LIST ITEM */
  "--item-bg": "rgba(17, 24, 39, 0.55)",
  "--item-border": "rgba(255, 255, 255, 0.08)",
  "--item-hover-bg": "rgba(17, 24, 39, 0.62)",
  "--item-hover-border": "rgba(255, 255, 255, 0.12)",
  "--item-hover-shadow": "0 12px 35px rgba(0, 0, 0, 0.28)",
  "--item-active-scale": "0.995",

  /* FIELD */
  "--field-bg": "rgba(17, 24, 39, 0.55)",
  "--field-border": "rgba(255, 255, 255, 0.1)",
  "--field-focus-border": "rgba(91, 140, 255, 0.35)",
  "--field-placeholder": "rgba(161, 161, 170, 0.75)",

  /* BUTTON */
  "--btn-primary-bg": "#f4f4f5",
  "--btn-primary-fg": "#0b1020",
  "--btn-primary-border": "rgba(244, 244, 245, 0.6)",
  "--btn-primary-hover-bg": "#ffffff",

  "--btn-secondary-bg": "rgba(17, 24, 39, 0.6)",
  "--btn-secondary-fg": "var(--text-3)",
  "--btn-secondary-border": "rgba(255,255,255,0.08)",
  "--btn-secondary-hover-bg": "rgba(17, 24, 39, 0.75)",

  "--btn-ghost-fg": "var(--text-3)",
  "--btn-ghost-hover-fg": "var(--text-2)",
  "--btn-ghost-hover-bg": "rgba(255, 255, 255, 0.04)",

  "--btn-outline-border": "rgba(255,255,255,0.08)",
  "--btn-outline-fg": "var(--text-3)",
  "--btn-outline-hover-bg": "rgba(255,255,255,0.04)",

  "--btn-danger-border": "rgba(239, 68, 68, 0.4)",
  "--btn-danger-fg": "#fca5a5",
  "--btn-danger-hover-bg": "rgba(239, 68, 68, 0.12)",

  "--btn-soft-hover-bg": "rgba(255, 255, 255, 0.04)",

  "--ring": "rgba(91, 140, 255, 0.35)",
  "--tw-ring-color": "var(--ring)",

  "--editor-bg": "var(--bg-elev-1)",
  "--editor-border": "var(--border-soft)",

  /* APP BACKGROUND */
  "--bg-app": `
    radial-gradient(
      900px circle at 50% -200px,
      rgba(59, 130, 246, 0.12),
      transparent 60%
    ),
    radial-gradient(
      700px circle at 10% 20%,
      rgba(99, 102, 241, 0.08),
      transparent 55%
    ),
    linear-gradient(180deg, #070b15 0%, #060913 100%)
  `,
} as const;
