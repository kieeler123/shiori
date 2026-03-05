// brownArchiveTheme.ts
export const brownArchiveTheme: Record<string, string> = {
  "--admin-table-wrap-border": "rgba(120,90,60,0.25)",
  "--admin-table-head-bg": "rgba(60,40,25,0.70)",
  "--admin-table-head-fg": "var(--text-5)",
  "--admin-table-row-border": "rgba(120,90,60,0.20)",
  "--admin-table-row-hover": "rgba(160,120,80,0.12)",
  "--admin-table-row-stripe": "rgba(120,90,60,0.05)",
  "--admin-table-row-selected": "rgba(160,120,80,0.18)",
  "--admin-table-focus-ring": "rgba(200,150,100,0.35)",

  "--admin-status-active": "#4ade80",
  "--admin-status-user-trash": "#facc15",
  "--admin-status-admin-trash": "#fb923c",
  "--admin-status-danger": "#ef4444",

  "--admin-btn-bg": "rgba(160,120,80,0.14)",
  "--admin-btn-hover": "rgba(160,120,80,0.20)",
  "--admin-btn-border": "rgba(160,120,80,0.35)",
  "--admin-btn-danger": "rgba(239,68,68,0.20)",

  "--admin-panel-bg": "rgba(45,30,18,0.65)",
  "--admin-panel-border": "rgba(160,120,80,0.25)",
  "--admin-panel-hover": "rgba(160,120,80,0.08)",
  "--admin-panel-muted": "rgba(160,120,80,0.05)",

  "--chart-1": "#f59e0b", // amber
  "--chart-2": "#fb7185", // rose
  "--chart-3": "#22c55e", // green

  "--chart-grid": "rgba(255,255,255,0.05)",
  "--chart-tooltip-bg": "rgba(18,14,10,0.92)",
  "--chart-tooltip-border": "rgba(255,255,255,0.10)",

  "--chart-hover-bg": "rgba(255,255,255,0.05)",
  "--chart-hover-line": "rgba(255,255,255,0.16)",

  "--chart-pie-stroke": "rgba(255,255,255,0.16)",
  "--chart-pie-ring": "rgba(245,158,11,0.16)",

  /* HIGHLIGHT */
  "--hl-title-bg": "rgba(251, 191, 36, 0.18)", // warm amber
  "--hl-title-fg": "var(--text-2)",
  "--hl-body-bg": "rgba(249, 115, 22, 0.16)", // orange
  "--hl-body-fg": "var(--text-2)",
  "--hl-tag-bg": "rgba(163, 230, 53, 0.14)", // lime
  "--hl-tag-fg": "var(--text-2)",

  "--accent": "#f59e0b", // amber-500
  "--accent-weak": "rgba(245, 158, 11, 0.18)",
  /* TEXT */
  "--text-1": "#f5f3ef",
  "--text-2": "#e9e4dc",
  "--text-3": "#d8d1c6",
  "--text-4": "#b8aea0",
  "--text-5": "#9c9182",
  "--text-6": "#7c7266",

  /* APP BACKGROUND */
  "--bg-app": [
    "radial-gradient(900px circle at 50% -200px, rgba(180, 120, 70, 0.12), transparent 60%)",
    "linear-gradient(180deg, #1b1612 0%, #14110d 100%)",
  ].join(","),

  /* HEADER */
  "--header-bg": "rgba(28, 22, 17, 0.82)",
  "--header-border": "rgba(255, 255, 255, 0.08)",
  "--header-shadow": "0 12px 35px rgba(0, 0, 0, 0.4)",
  "--header-blur": "10px",

  "--menu-bg": "rgba(40, 32, 25, 0.92)", // ✅ 메뉴판 더 잘 보이게(불투명 ↑)
  "--menu-border": "rgba(255,255,255,0.10)",
  "--menu-shadow": "0 18px 45px rgba(0,0,0,0.45)",

  "--overlay-bg": "rgba(0,0,0,0.28)", // ✅ 뒤 글자만 죽이는 정도(너무 어둡지 않게)
  "--overlay-blur": "2px",

  /* SURFACE */
  "--bg-elev-1": "rgba(34, 27, 21, 0.8)",
  "--bg-elev-2": "rgba(40, 32, 25, 0.85)",
  "--surface-3": "rgba(45, 36, 28, 0.92)",
  "--surface-2": "rgba(34, 27, 21, 0.8)",

  /* BORDERS */
  "--border-soft": "rgba(255, 255, 255, 0.08)", // ✅ 조금 더 또렷하게
  "--border-strong": "rgba(255, 255, 255, 0.14)",

  /* LIST ITEM */
  "--item-bg": "rgba(40, 32, 25, 0.75)",
  "--item-border": "rgba(255, 255, 255, 0.08)",
  "--item-hover-bg": "rgba(48, 38, 30, 0.82)",
  "--item-hover-border": "rgba(255, 255, 255, 0.14)",
  "--item-hover-shadow": "0 10px 30px rgba(0, 0, 0, 0.35)",
  "--item-active-scale": "0.995",

  /* FIELD */
  "--field-bg": "rgba(40, 32, 25, 0.75)",
  "--field-border": "rgba(255, 255, 255, 0.10)", // ✅ 테두리 더 보이게
  "--field-focus-border": "rgba(180, 120, 70, 0.45)", // ✅ 브라운 포인트
  "--field-placeholder": "rgba(156, 145, 130, 0.75)",

  /* FOCUS */
  "--ring": "rgba(180, 120, 70, 0.35)", // ✅ 이제 브라운에서 파란 링 안 남음

  /* BUTTON */
  "--btn-primary-bg": "#f5f3ef",
  "--btn-primary-fg": "#1b1612",
  "--btn-primary-border": "rgba(245, 243, 239, 0.6)",
  "--btn-primary-hover-bg": "#ffffff",

  "--btn-secondary-bg": "rgba(40, 32, 25, 0.75)",
  "--btn-secondary-fg": "var(--text-3)",
  "--btn-secondary-border": "rgba(255,255,255,0.10)",
  "--btn-secondary-hover-bg": "rgba(48, 38, 30, 0.88)",

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

  /* ICON BTN (header menu 등) */
  "--btn-icon-fg": "var(--text-3)",
  "--btn-icon-hover-fg": "var(--text-2)",
  "--btn-icon-hover-bg": "rgba(255,255,255,0.06)",

  /* EDITOR */
  "--editor-bg": "var(--bg-elev-1)",
  "--editor-border": "var(--border-soft)",

  /* USER CHIP (헤더 로그인/로그아웃) */
  "--userchip-bg": "rgba(40, 32, 25, 0.55)",
  "--userchip-hover-bg": "rgba(48, 38, 30, 0.78)",
  "--userchip-border": "rgba(255,255,255,0.10)",
  "--userchip-avatar-bg": "rgba(34, 27, 21, 0.85)",
  "--userchip-text": "var(--text-3)",
  "--userchip-subtext": "var(--text-6)",
};
