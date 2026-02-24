// plumNightTheme.ts
export const plumNightTheme: Record<string, string> = {
  /* HIGHLIGHT */
  "--hl-title-bg": "rgba(167, 139, 250, 0.22)", // violet
  "--hl-title-fg": "var(--text-2)",
  "--hl-body-bg": "rgba(244, 114, 182, 0.18)", // pink
  "--hl-body-fg": "var(--text-2)",
  "--hl-tag-bg": "rgba(251, 191, 36, 0.16)", // amber
  "--hl-tag-fg": "var(--text-2)",

  "--accent": "#a78bfa", // violet-400
  "--accent-weak": "rgba(167, 139, 250, 0.18)",

  /* TEXT */
  "--text-1": "#faf7ff",
  "--text-2": "#f2ecff",
  "--text-3": "#e6ddff",
  "--text-4": "#cbbcf3",
  "--text-5": "#a992d8",
  "--text-6": "#7f6aa8",

  /* APP BACKGROUND */
  "--bg-app": [
    "radial-gradient(900px circle at 50% -220px, rgba(168, 85, 247, 0.14), transparent 62%)",
    "radial-gradient(720px circle at 12% 18%, rgba(236, 72, 153, 0.10), transparent 55%)",
    "linear-gradient(180deg, #0b0614 0%, #07030f 100%)",
  ].join(","),

  /* HEADER */
  "--header-bg": "rgba(12, 6, 22, 0.78)",
  "--header-border": "rgba(255, 255, 255, 0.10)",
  "--header-shadow": "0 12px 35px rgba(0, 0, 0, 0.45)",
  "--header-blur": "10px",

  /* SURFACE */
  "--bg-elev-1": "rgba(18, 10, 32, 0.82)",
  "--bg-elev-2": "rgba(16, 9, 28, 0.72)",
  "--surface-3": "rgba(24, 14, 40, 0.92)",
  "--surface-2": "rgba(18, 10, 32, 0.80)",

  /* BORDERS */
  "--border-soft": "rgba(255, 255, 255, 0.08)",
  "--border-strong": "rgba(255, 255, 255, 0.14)",

  /* LIST ITEM */
  "--item-bg": "rgba(18, 10, 32, 0.62)",
  "--item-border": "rgba(255, 255, 255, 0.08)",
  "--item-hover-bg": "rgba(24, 14, 40, 0.72)",
  "--item-hover-border": "rgba(255, 255, 255, 0.14)",
  "--item-hover-shadow": "0 12px 35px rgba(0, 0, 0, 0.35)",
  "--item-active-scale": "0.995",

  /* FIELD */
  "--field-bg": "rgba(18, 10, 32, 0.72)",
  "--field-border": "rgba(255, 255, 255, 0.10)",
  "--field-focus-border": "rgba(168, 85, 247, 0.55)",
  "--field-placeholder": "rgba(169, 146, 216, 0.70)",

  /* BUTTON */
  "--btn-primary-bg": "#f2ecff",
  "--btn-primary-fg": "#120a20",
  "--btn-primary-border": "rgba(242, 236, 255, 0.55)",
  "--btn-primary-hover-bg": "#ffffff",

  "--btn-secondary-bg": "rgba(18, 10, 32, 0.72)",
  "--btn-secondary-fg": "var(--text-3)",
  "--btn-secondary-border": "rgba(255, 255, 255, 0.10)",
  "--btn-secondary-hover-bg": "rgba(24, 14, 40, 0.80)",

  "--btn-ghost-fg": "var(--text-3)",
  "--btn-ghost-hover-fg": "var(--text-2)",
  "--btn-ghost-hover-bg": "rgba(255, 255, 255, 0.05)",

  "--btn-outline-border": "rgba(255, 255, 255, 0.10)",
  "--btn-outline-fg": "var(--text-3)",
  "--btn-outline-hover-bg": "rgba(255, 255, 255, 0.05)",

  "--btn-danger-border": "rgba(239, 68, 68, 0.40)",
  "--btn-danger-fg": "#fca5a5",
  "--btn-danger-hover-bg": "rgba(239, 68, 68, 0.12)",

  /* ✅ icon/soft가 쓰는 토큰 (없으면 네이비 값이 남을 수 있음) */
  "--btn-icon-fg": "var(--text-3)",
  "--btn-icon-hover-fg": "var(--text-2)",
  "--btn-icon-hover-bg": "rgba(255, 255, 255, 0.06)",
  "--btn-soft-hover-bg": "rgba(255, 255, 255, 0.05)",

  /* FOCUS */
  "--ring": "rgba(168, 85, 247, 0.35)",
  "--tw-ring-color": "var(--ring)",

  "--menu-bg": "rgba(18, 10, 32, 0.94)", // 메뉴판이 더 잘 보이게
  "--menu-border": "rgba(255, 255, 255, 0.12)",
  "--menu-shadow": "0 25px 65px rgba(0, 0, 0, 0.50)",
  "--overlay-bg": "rgba(0, 0, 0, 0.35)", // 뒤 글자 덜 비치게
  "--overlay-blur": "2px",

  /* =========================
     LOGIN / HEADER BUTTON TOKENS
     (헤더 로그인 버튼 = authchip / nav 버튼 계열)
     ========================= */
  "--btn-nav-bg": "rgba(24, 13, 40, 0.55)",
  "--btn-nav-fg": "var(--text-3)",
  "--btn-nav-border": "rgba(255, 255, 255, 0.12)",
  "--btn-nav-hover-bg": "rgba(32, 16, 54, 0.72)",
  "--btn-nav-hover-border": "rgba(255, 255, 255, 0.18)",

  /* (옵션) userchip도 같이 쓰는 경우 */
  "--userchip-bg": "rgba(24, 13, 40, 0.55)",
  "--userchip-hover-bg": "rgba(32, 16, 54, 0.72)",
  "--userchip-border": "rgba(255, 255, 255, 0.12)",
  "--userchip-avatar-bg": "rgba(18, 10, 30, 0.85)",
  "--userchip-text": "var(--text-3)",
  "--userchip-subtext": "var(--text-6)",

  /* EDITOR */
  "--editor-bg": "var(--bg-elev-1)",
  "--editor-border": "var(--border-soft)",
};
