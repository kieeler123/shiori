export const brownTheme: Record<string, string> = {
  /* Text */
  "--text-1": "#f5f3ef",
  "--text-2": "#e9e4dc",
  "--text-3": "#d8d1c6",
  "--text-4": "#b8aea0",
  "--text-5": "#9c9182",
  "--text-6": "#7c7266",

  /* Background */
  "--bg-app": [
    "radial-gradient(900px circle at 50% -200px, rgba(180, 120, 70, 0.12), transparent 60%)",
    "linear-gradient(180deg, #1b1612 0%, #14110d 100%)",
  ].join(","),

  /* Header */
  "--header-bg": "rgba(28, 22, 17, 0.82)",
  "--header-border": "rgba(255, 255, 255, 0.08)",
  "--header-shadow": "0 12px 35px rgba(0, 0, 0, 0.4)",
  "--header-blur": "10px",

  /* Surfaces */
  "--bg-elev-1": "rgba(34, 27, 21, 0.8)",
  "--bg-elev-2": "rgba(40, 32, 25, 0.85)",

  "--surface-3": "rgba(45, 36, 28, 0.92)",
  "--surface-2": "rgba(34, 27, 21, 0.8)",

  /* Borders */
  "--border-soft": "rgba(255, 255, 255, 0.06)",
  "--border-strong": "rgba(255, 255, 255, 0.12)",

  /* List */
  "--item-bg": "rgba(40, 32, 25, 0.75)",
  "--item-border": "rgba(255, 255, 255, 0.06)",
  "--item-hover-bg": "rgba(48, 38, 30, 0.82)",
  "--item-hover-border": "rgba(255, 255, 255, 0.12)",

  /* Focus (기술 느낌 30% 유지) */
  "--ring": "rgba(91, 140, 255, 0.35)",
};
