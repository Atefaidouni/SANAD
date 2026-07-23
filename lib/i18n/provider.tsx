"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import {
  defaultLocale,
  localeDir,
  localeGradientAngle,
  type Locale,
} from "./config";

const dictionaries: Record<Locale, Record<string, unknown>> = { en, ar };

type Vars = Record<string, string | number>;

interface I18nContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, vars?: Vars) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function getPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{${k}}`
  );
}

const STORAGE_KEY = "sanad.locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Server + first client paint use the default locale to avoid mismatch;
  // the persisted locale is applied in an effect after mount.
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const stored =
      (typeof window !== "undefined" &&
        (window.localStorage.getItem(STORAGE_KEY) as Locale | null)) ||
      null;
    if (stored && stored !== locale) setLocaleState(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const dir = localeDir[locale];
    const html = document.documentElement;
    html.lang = locale;
    html.dir = dir;
    html.style.setProperty("--brand-angle", localeGradientAngle[locale]);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, locale);
    }
  }, [locale]);

  const setLocale = (l: Locale) => setLocaleState(l);
  const toggleLocale = () => setLocaleState((p) => (p === "en" ? "ar" : "en"));

  const t = useMemo(() => {
    const dict = dictionaries[locale];
    const fallback = dictionaries.en;
    return (key: string, vars?: Vars): string => {
      const value = getPath(dict, key) ?? getPath(fallback, key);
      if (typeof value === "string") return interpolate(value, vars);
      return key;
    };
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, dir: localeDir[locale], setLocale, toggleLocale, t }),
    [locale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Shorthand: just the translate function. */
export function useT() {
  return useI18n().t;
}
