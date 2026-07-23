export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeDir: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

export const localeNames: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

/** Gradient angle flips so the brand gradient mirrors in RTL. */
export const localeGradientAngle: Record<Locale, string> = {
  en: "135deg",
  ar: "225deg",
};
