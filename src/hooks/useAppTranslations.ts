"use client";

import { useTranslations, useLocale as useNextIntlLocale } from "next-intl";
import { Locale } from "@/types";

// WARNING: This hook must only be used in Client Components ('use client')
export function useAppTranslations() {
  return {
    app: useTranslations("app"),
    language: useTranslations("language"),
    nav: useTranslations("nav"),
    modules: useTranslations("modules"),
    video: useTranslations("video"),
    breathhold: useTranslations("breathhold"),
    visual: useTranslations("visual"),
    feedback: useTranslations("feedback"),
    errors: useTranslations("errors"),
    admin: useTranslations("admin"),
  };
}

export function useLocale(): Locale {
  return useNextIntlLocale() as Locale;
}
