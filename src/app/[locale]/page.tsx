import { redirect } from "next/navigation";
import { unstable_setRequestLocale } from "next-intl/server";
import { validateLocale } from "@/lib/i18n";
import { LOCALES, type Locale } from "@/types";
import LanguagePickerScreen from "@/components/patient/LanguagePickerScreen";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default function LocaleRootPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = validateLocale(params.locale);
  unstable_setRequestLocale(locale);

  // When a user arrives at /en, /sn, or /nd directly,
  // we render the language picker so they can start a session.
  // We no longer redirect to /modules here to avoid a redirect loop
  // if the session isn't initialized yet.
  return <LanguagePickerScreen suggestedLocale={locale} />;
}
