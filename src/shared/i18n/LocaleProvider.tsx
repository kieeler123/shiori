import { createContext, useContext, useMemo, useState } from "react";
import { type Locale, MESSAGES, getByPath } from "./i18n";

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const Ctx = createContext<I18nContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(
    (localStorage.getItem("shiori.locale") as Locale) || "ja",
  );

  const setLocale = (l: Locale) => {
    localStorage.setItem("shiori.locale", l);
    setLocaleState(l);
  };

  const messages = MESSAGES[locale];

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: string) => getByPath(messages, key) ?? key,
    }),
    [locale],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("LocaleProvider missing");
  return ctx;
}
