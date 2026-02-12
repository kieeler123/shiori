import { createContext, useContext } from "react";
import type { ThemeName } from "./theme.types";

export type ThemeCtx = {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
};

export const ThemeContext = createContext<ThemeCtx | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
