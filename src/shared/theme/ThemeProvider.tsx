import React, { createContext, useEffect, useMemo, useState } from "react";

export type Theme = "white" | "black" | "blue";

export type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): Theme {
  // SSR 안전장치(혹시 나중에 Next로 옮겨도 안 터지게)
  if (typeof window === "undefined") return "black";

  const saved = localStorage.getItem("theme");
  if (saved === "white" || saved === "black") return saved;

  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;

  return systemPrefersDark ? "black" : "white";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () =>
    setTheme((prev) => (prev === "white" ? "black" : "white"));

  const value = useMemo(
    () => ({
      theme,
      setTheme, // ✅ 이제 외부에서 직접 지정 가능
      toggle,
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
