import { notFound } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { validateLocale } from "@/lib/i18n";
import type { Locale } from "@/types";
import { LOCALES } from "@/types";
import FeedbackScreen from "@/components/patient/FeedbackScreen";

// 1. Fully static offline path generation
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

// 2. Localized SEO & Shell boundaries
export async function generateMetadata({ 
  params 
}: { 
  params: { locale: string } 
}) {
  const locale = validateLocale(params.locale);
  if (!locale) return {};

  const t = await getTranslations({ locale });
  return {
    title: `${(t as any).raw("feedback.title")} — ClarityScans`,
    description: "Post-scan patient feedback and anxiety assessment",
  };
}

interface FeedbackPageProps {
  params: { locale: string };
}

// 3. Primary Server Layout Route
export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const locale = validateLocale(params.locale);
  if (!locale) notFound();

  // Explicit Next-Intl context mapping
  unstable_setRequestLocale(locale);

  // Directly yield to client engine bypassing DB queries maximizing speed
  return <FeedbackScreen locale={locale} />;
}
