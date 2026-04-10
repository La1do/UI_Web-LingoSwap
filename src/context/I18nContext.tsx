import React, { createContext, useContext, useState } from "react";
import type { Translation } from "../i18n/types";
import { vi } from "../i18n/locales/vi";
import { en } from "../i18n/locales/en";

// ─── Supported locales ───────────────────────────────────────
// Thêm ngôn ngữ mới: import file locale và thêm vào đây
export type Locale = "vi" | "en";

const locales: Record<Locale, Translation> = { vi, en };

export const localeLabels: Record<Locale, string> = {
  vi: "Tiếng Việt",
  en: "English",
};

// ─── Context ─────────────────────────────────────────────────
interface I18nContextValue {
  locale: Locale;
  t: Translation;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "vi",
  t: vi,
  setLocale: () => {},
});

// ─── Provider ────────────────────────────────────────────────
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    return (localStorage.getItem("locale") as Locale) ?? "vi";
  });

  const setLocale = (next: Locale) => {
    localStorage.setItem("locale", next);
    setLocaleState(next);
  };

  return (
    <I18nContext.Provider value={{ locale, t: locales[locale], setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────
export const useI18n = () => useContext(I18nContext);
