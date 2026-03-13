import { getRequestConfig } from "next-intl/server";
import { Locale, LOCALES, DEFAULT_LOCALE } from "@/types";

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!LOCALES.includes(locale as Locale)) {
    return {
      messages: (await import(`../messages/${DEFAULT_LOCALE}.json`)).default,
      timeZone: "Africa/Harare",
      now: new Date(),
    };
  }

  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(
      `Failed to load messages for locale: ${locale}. Falling back to ${DEFAULT_LOCALE}.`,
      error
    );
    messages = (await import(`../messages/${DEFAULT_LOCALE}.json`)).default;
  }

  if (process.env.NODE_ENV === "development") {
    const { validateTranslationCompleteness } = await import("../lib/validateTranslations");
    validateTranslationCompleteness();
  }

  return {
    messages,
    timeZone: "Africa/Harare",
    now: new Date(),
  };
});
