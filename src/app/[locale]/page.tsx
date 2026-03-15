import { redirect } from "next/navigation";
import { unstable_setRequestLocale } from "next-intl/server";
import { validateLocale } from "@/lib/i18n";
import { LOCALES } from "@/types";

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
  // they've already chosen a language — send them to modules
  redirect(`/${locale}/modules`);
}
