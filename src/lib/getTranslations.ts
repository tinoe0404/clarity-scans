import { getTranslations } from "next-intl/server";
import { Locale } from "@/types";

export async function getAppTranslations(locale: Locale) {
  return {
    app: await getTranslations({ locale, namespace: "app" }),
    language: await getTranslations({ locale, namespace: "language" }),
    nav: await getTranslations({ locale, namespace: "nav" }),
    modules: await getTranslations({ locale, namespace: "modules" }),
    video: await getTranslations({ locale, namespace: "video" }),
    breathhold: await getTranslations({ locale, namespace: "breathhold" }),
    visual: await getTranslations({ locale, namespace: "visual" }),
    feedback: await getTranslations({ locale, namespace: "feedback" }),
    errors: await getTranslations({ locale, namespace: "errors" }),
    admin: await getTranslations({ locale, namespace: "admin" }),
  };
}
