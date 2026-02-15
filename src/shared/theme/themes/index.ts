import type { ThemePreset } from "../theme.types";
import { navyTheme } from "./navyTheme";
import { darkGrayTheme } from "./darkGrayTheme";
import { pureDarkTheme } from "./pureDarkTheme";
import { whitePaperTheme } from "./whitePaperTheme";
import { sageMistTheme } from "./sageMistTheme";
import { plumNightTheme } from "./plumNightTheme";
import { tealGlassTheme } from "./tealGlassTheme";
import { brownArchiveTheme } from "./brownTheme";

export const THEME_PRESETS: ThemePreset[] = [
  { name: "navy", label: "Navy", tokens: navyTheme },
  { name: "darkGray", label: "Dark Gray", tokens: darkGrayTheme },
  { name: "pureDark", label: "Pure Dark", tokens: pureDarkTheme },
  { name: "brownArchive", label: "Brown Archive", tokens: brownArchiveTheme },
  { name: "whitePaper", label: "White Paper", tokens: whitePaperTheme },
  { name: "sageMist", label: "sageMist", tokens: sageMistTheme },
  { name: "plumNight", label: "plumNight", tokens: plumNightTheme },
  { name: "tealGlass", label: "tealGlass", tokens: tealGlassTheme },
];

export function findPreset(
  name:
    | "navy"
    | "darkGray"
    | "pureDark"
    | "brownArchive"
    | "whitePaper"
    | "sageMist"
    | "plumNight"
    | "tealGlass",
) {
  return THEME_PRESETS.find((p) => p.name === name)!;
}
