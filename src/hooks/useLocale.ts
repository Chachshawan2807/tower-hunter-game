import { useCallback, useEffect, useState } from "react";
import type { Locale } from "../utils/i18n";

const LOCALE_KEY = "tower_hunter_locale";

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem(LOCALE_KEY);
    return stored === "th" ? "th" : "en";
  });

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(LOCALE_KEY, next);
    setLocaleState(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "th" : "en");
  }, [locale, setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return { locale, setLocale, toggleLocale };
}
