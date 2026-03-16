import { unstable_setRequestLocale } from "next-intl/server";
import { validateLocale } from "@/lib/i18n";
import { LOCALES } from "@/types";
import LanguagePickerScreen from "@/components/patient/LanguagePickerScreen";
import { Suspense } from "react";

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
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-surface-card"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>}>
      <LanguagePickerScreen suggestedLocale={locale} />
    </Suspense>
  );
}
