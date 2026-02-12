import type { ThemeName } from "./theme.types";

const KEY = "shiori.theme";
const DEFAULT_THEME: ThemeName = "navy";

export function getTheme(): ThemeName {
  const v = localStorage.getItem(KEY);
  if (
    v === "pureDark" ||
    v === "darkGray" ||
    v === "navy" ||
    v === "brownArchive" ||
    v === "custom"
  ) {
    return v;
  }
  return DEFAULT_THEME;
}

export function setThemeName(theme: ThemeName) {
  localStorage.setItem(KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
}

export function initThemeName() {
  document.documentElement.setAttribute("data-theme", getTheme());
}
