export type ThemeName = "dark" | "white" | "blue" | "custom";

const KEY = "shiori.theme";

export function getTheme(): ThemeName {
  const v = localStorage.getItem(KEY);
  if (v === "dark" || v === "white" || v === "blue" || v === "custom") return v;
  return "dark";
}

export function setTheme(theme: ThemeName) {
  localStorage.setItem(KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
}

export function initTheme() {
  document.documentElement.setAttribute("data-theme", getTheme());
}
