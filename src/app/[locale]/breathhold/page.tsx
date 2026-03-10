import { notFound } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { validateLocale } from "@/lib/i18n";
import type { Locale } from "@/types";
import { LOCALES } from "@/types";
import BreathHoldScreen from "@/components/patient/BreathHoldScreen";

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
    title: `${(t as any).raw("breathhold.title")} — ClarityScans`,
    description: "Interactive CT Scan breath hold trainer",
  };
}

interface BreathHoldPageProps {
  params: { locale: string };
}

// 3. Primary Server Layout Route
export default async function BreathHoldPage({ params }: BreathHoldPageProps) {
  const locale = validateLocale(params.locale);
  if (!locale) notFound();

  // Explicit Next-Intl context mapping
  unstable_setRequestLocale(locale);

  // Directly yield to client engine matching Phase 11 layout spec 
  // bypassing any DB requests maximizing offline speed natively
  return <BreathHoldScreen locale={locale} />;
}
