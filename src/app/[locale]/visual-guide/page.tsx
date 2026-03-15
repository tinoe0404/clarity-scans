/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { validateLocale } from "@/lib/i18n";
import { LOCALES } from "@/types";
import { SIGNAL_REGISTRY } from "@/lib/signalRegistry";
import VisualGuideScreen from "@/components/patient/VisualGuideScreen";
// Static path generation for offline support
export const dynamic = "force-static";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

// Localized SEO
export async function generateMetadata({ params }: { params: { locale: string } }) {
  const locale = validateLocale(params.locale);
  if (!locale) return {};

  const t = await getTranslations({ locale });
  return {
    title: `${(t as any).raw("visual.title")} — ClarityScans`,
    description: "Visual communication board for CT scan patients in scanner rooms.",
  };
}

interface VisualGuidePageProps {
  params: { locale: string };
}

// Main Page Component
export default async function VisualGuidePage({ params }: VisualGuidePageProps) {
  const locale = validateLocale(params.locale);
  if (!locale) notFound();

  // Set next-intl locale context
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale });

  // Resolve translations statically on the server
  const translatedSignals = SIGNAL_REGISTRY.map((signal) => ({
    ...signal,
    translatedLabel: (t as any).raw(`visual.signals.${signal.translationKey}` as string),
  }));

  // Render the client component
  return (
    <VisualGuideScreen
      locale={locale}
      signals={translatedSignals}
      title={(t as any).raw("visual.title")}
      subtitle={(t as any).raw("visual.subtitle")}
    />
  );
}
