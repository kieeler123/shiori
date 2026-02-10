export type ThemeName = "white" | "black" | "blue";

export const themeTokens: Record<ThemeName, Record<string, string>> = {
  white: {
    "--bg": "#fafafa",
    "--fg": "#18181b",
    "--muted": "#71717a",
    "--border": "#e4e4e7",
    "--primary": "#2563eb",
  },
  black: {
    "--bg": "#18181b",
    "--fg": "#fafafa",
    "--muted": "#a1a1aa",
    "--border": "#27272a",
    "--primary": "#3b82f6",
  },
  blue: {
    "--bg": "#f8fafc",
    "--fg": "#0f172a",
    "--muted": "#64748b",
    "--border": "#e2e8f0",
    "--primary": "#2563eb",
  },
};
