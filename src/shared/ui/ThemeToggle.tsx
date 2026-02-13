// src/shared/ui/ThemeToggle.tsx
import { useTheme } from "@/shared/theme/useTheme";
import { THEME_PRESETS } from "@/shared/theme/themes";
import type { ThemeName } from "@/shared/theme/theme.types";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const names = THEME_PRESETS.map((p) => p.name) as ThemeName[];
  const idx = Math.max(0, names.indexOf(theme));
  const next = names[(idx + 1) % names.length] ?? "navy";

  return (
    <button type="button" onClick={() => setTheme(next)}>
      Theme: {theme} → {next}
    </button>
  );
}
