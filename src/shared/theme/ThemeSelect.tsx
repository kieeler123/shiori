import { THEME_PRESETS } from "./themes";
import { useTheme } from "./useTheme";

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as any)}
      className="rounded-xl border border-[var(--border-soft)] bg-[var(--item-bg)] px-3 py-2 text-sm t2"
    >
      {THEME_PRESETS.map((p) => (
        <option key={p.name} value={p.name}>
          {p.label}
        </option>
      ))}
    </select>
  );
}
