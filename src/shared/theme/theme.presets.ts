import type { ThemePreset, ThemeName } from "./theme.types";

import { navyTheme } from "./themes/navyTheme";
import { pureDarkTheme } from "./themes/pureDarkTheme";
import { darkGrayTheme } from "./themes/darkGrayTheme";
import { brownArchiveTheme } from "./themes/brownArchiveTheme";
import { whitePaperTheme } from "./themes/whitePaperTheme";
import { sageMistTheme } from "./themes/sageMistTheme";
import { tealGlassTheme } from "./themes/tealGlassTheme";
import { plumNightTheme } from "./themes/plumNightTheme";

export const THEME_PRESETS: ThemePreset[] = [
  { name: "navy", label: "Navy", tokens: navyTheme },
  { name: "pureDark", label: "Pure Dark", tokens: pureDarkTheme },
  { name: "darkGray", label: "Dark Gray", tokens: darkGrayTheme },
  { name: "brownArchive", label: "Brown Archive", tokens: brownArchiveTheme },
  { name: "whitePaper", label: "White Paper", tokens: whitePaperTheme },
  { name: "sageMist", label: "Sage Mist", tokens: sageMistTheme },
  { name: "tealGlass", label: "Teal Glass", tokens: tealGlassTheme },
  { name: "plumNight", label: "Plum Night", tokens: plumNightTheme },
];

export function findPreset(name: Exclude<ThemeName, "custom">) {
  // 혹시라도 누락되면 바로 터지게(개발 단계에선 이게 더 좋아)
  const p = THEME_PRESETS.find((x) => x.name === name);
  if (!p) throw new Error(`Theme preset not found: ${name}`);
  return p;
}
