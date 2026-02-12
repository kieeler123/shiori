import type { ThemePreset } from "../theme.types";
import { navyTheme } from "./navyTheme";
import { darkGrayTheme } from "./darkGrayTheme";
import { pureDarkTheme } from "./pureDarkTheme";
import { brownTheme } from "./brownTheme";

export const THEME_PRESETS: ThemePreset[] = [
  { name: "navy", label: "Navy", tokens: navyTheme },
  { name: "darkGray", label: "Dark Gray", tokens: darkGrayTheme },
  { name: "pureDark", label: "Pure Dark", tokens: pureDarkTheme },
  { name: "brownArchive", label: "Brown Archive", tokens: brownTheme },
];

export function findPreset(
  name: "navy" | "darkGray" | "pureDark" | "brownArchive",
) {
  return THEME_PRESETS.find((p) => p.name === name)!;
}
