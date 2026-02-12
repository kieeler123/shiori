import { useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./useTheme";
import type { ThemeName } from "./theme.types";
import { getTheme, setThemeName } from "./theme.storage";
import { applyThemeTokens } from "./theme.apply";
import { findPreset } from "./themes";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<ThemeName>(() => getTheme());

  useEffect(() => {
    // data-theme 세팅
    setThemeName(theme);

    // preset이면 토큰도 적용
    if (theme === "custom") return;
    const preset = findPreset(theme);
    applyThemeTokens(preset.tokens);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (t: ThemeName) => setThemeState(t),
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
