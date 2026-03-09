import { Locale, LOCALES } from "@/types";
import { NotFoundError } from "./errors";

const LOCALE_DATA: Record<Locale, { native: string; english: string; flag: string }> = {
  en: { native: "English", english: "English", flag: "🇬🇧" },
  sn: { native: "ChiShona", english: "Shona", flag: "🇿🇼" },
  nd: { native: "isiNdebele", english: "Ndebele", flag: "🇿🇼" },
};

export function validateLocale(locale: string): Locale {
  if (!LOCALES.includes(locale as Locale)) {
    throw new NotFoundError(`Invalid locale: ${locale}`);
  }
  return locale as Locale;
}

export function getLocaleDisplayName(locale: Locale) {
  return LOCALE_DATA[locale];
}

export function getAlternateLocales(current: Locale): Locale[] {
  return LOCALES.filter((l) => l !== current);
}

export function localePath(locale: Locale, path: string): string {
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  // Avoid double slashes if path is exactly '/'
  return normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
}
