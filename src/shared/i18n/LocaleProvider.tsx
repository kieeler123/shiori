import { createContext, useContext, useMemo, useState } from "react";
import { type Locale, MESSAGES, getByPath } from "./i18n";

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const Ctx = createContext<I18nContextValue | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => {
    const v = vars[k];
    return v === undefined || v === null ? "" : String(v);
  });
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(
    (localStorage.getItem("shiori.locale") as Locale) || "ja",
  );

  const setLocale = (l: Locale) => {
    localStorage.setItem("shiori.locale", l);
    setLocaleState(l);
  };

  const messages = MESSAGES[locale];

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: string, params?: Record<string, string | number>) => {
      const template = getByPath(messages, key);
      if (typeof template !== "string") return key; // 없거나 문자열 아니면 key fallback
      return interpolate(template, params);
    };

    return { locale, setLocale, t };
  }, [locale, messages]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("LocaleProvider missing");
  return ctx;
}
