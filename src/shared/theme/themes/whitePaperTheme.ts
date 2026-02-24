export const whitePaperTheme: Record<string, string> = {
  /* HIGHLIGHT */
  "--hl-title-bg": "rgba(59, 130, 246, 0.22)", // blue
  "--hl-title-fg": "rgba(24, 24, 27, 0.95)",
  "--hl-body-bg": "rgba(245, 158, 11, 0.26)", // amber
  "--hl-body-fg": "rgba(24, 24, 27, 0.95)",
  "--hl-tag-bg": "rgba(34, 197, 94, 0.22)", // green
  "--hl-tag-fg": "rgba(24, 24, 27, 0.95)",

  "--accent": "#334155", // slate-700 느낌(잉크)
  "--accent-weak": "rgba(51, 65, 85, 0.14)",
  /* TEXT */
  "--text-1": "#0f172a",
  "--text-2": "#111827",
  "--text-3": "#1f2937",
  "--text-4": "#374151",
  "--text-5": "#6b7280",
  "--text-6": "#9ca3af",

  /* APP BG */
  "--bg-app": [
    "radial-gradient(900px circle at 50% -240px, rgba(166,124,82,0.12), transparent 58%)",
    "radial-gradient(700px circle at 10% 18%, rgba(15,23,42,0.06), transparent 55%)",
    "linear-gradient(180deg, #fbfbfa 0%, #f6f3ee 100%)",
  ].join(","),

  /* HEADER */
  "--header-bg": "rgba(251, 251, 250, 0.78)",
  "--header-border": "rgba(15, 23, 42, 0.08)",
  "--header-shadow": "0 10px 30px rgba(15, 23, 42, 0.08)",
  "--header-blur": "10px",

  "--menu-bg": "rgba(255, 255, 255, 0.92)", // ✅ 밝은 메뉴판은 0.90~0.96 추천
  "--menu-border": "rgba(0,0,0,0.10)",
  "--menu-shadow": "0 18px 45px rgba(0,0,0,0.18)",

  "--overlay-bg": "rgba(0,0,0,0.18)", // ✅ 화이트에선 overlay 더 약하게
  "--overlay-blur": "2px",

  /* SURFACE */
  "--bg-elev-1": "rgba(255, 255, 255, 0.78)",
  "--bg-elev-2": "rgba(255, 255, 255, 0.62)",
  "--surface-3": "rgba(255, 255, 255, 0.92)",
  "--surface-2": "rgba(255, 255, 255, 0.72)",

  /* BORDERS */
  "--border-soft": "rgba(15, 23, 42, 0.10)",
  "--border-strong": "rgba(15, 23, 42, 0.16)",

  /* LIST */
  "--item-bg": "rgba(255, 255, 255, 0.72)",
  "--item-border": "rgba(15, 23, 42, 0.10)",
  "--item-hover-bg": "rgba(255, 255, 255, 0.92)",
  "--item-hover-border": "rgba(15, 23, 42, 0.18)",
  "--item-hover-shadow": "0 12px 35px rgba(15, 23, 42, 0.10)",
  "--item-active-scale": "0.995",

  /* FIELD */
  "--field-bg": "rgba(255, 255, 255, 0.92)",
  "--field-border": "rgba(15, 23, 42, 0.14)",
  "--field-focus-border": "#a67c52",
  "--field-placeholder": "rgba(15, 23, 42, 0.38)",

  /* FOCUS */
  "--ring": "rgba(166, 124, 82, 0.38)",

  /* BUTTON */
  "--btn-primary-bg": "#0f172a",
  "--btn-primary-fg": "#ffffff",
  "--btn-primary-border": "rgba(15, 23, 42, 0.22)",
  "--btn-primary-hover-bg": "#111c33",

  "--btn-secondary-bg": "rgba(255,255,255,0.72)",
  "--btn-secondary-fg": "var(--text-3)",
  "--btn-secondary-border": "rgba(15, 23, 42, 0.14)",
  "--btn-secondary-hover-bg": "rgba(255,255,255,0.92)",

  "--btn-ghost-fg": "var(--text-4)",
  "--btn-ghost-hover-fg": "var(--text-2)",
  "--btn-ghost-hover-bg": "rgba(15, 23, 42, 0.05)",

  "--btn-outline-border": "rgba(15, 23, 42, 0.14)",
  "--btn-outline-fg": "var(--text-3)",
  "--btn-outline-hover-bg": "rgba(15, 23, 42, 0.05)",

  "--btn-danger-border": "rgba(239, 68, 68, 0.30)",
  "--btn-danger-fg": "#b91c1c",
  "--btn-danger-hover-bg": "rgba(239, 68, 68, 0.10)",

  "--btn-soft-hover-bg": "rgba(15, 23, 42, 0.05)",

  /* ICON BTN */
  "--btn-icon-fg": "var(--text-4)",
  "--btn-icon-hover-fg": "var(--text-2)",
  "--btn-icon-hover-bg": "rgba(15, 23, 42, 0.05)",

  /* EDITOR */
  "--editor-bg": "var(--bg-elev-1)",
  "--editor-border": "var(--border-soft)",

  /* USER CHIP */
  "--userchip-bg": "rgba(255,255,255,0.62)",
  "--userchip-hover-bg": "rgba(255,255,255,0.92)",
  "--userchip-border": "rgba(15, 23, 42, 0.14)",
  "--userchip-avatar-bg": "rgba(15, 23, 42, 0.06)",
  "--userchip-text": "var(--text-3)",
  "--userchip-subtext": "var(--text-6)",
};
