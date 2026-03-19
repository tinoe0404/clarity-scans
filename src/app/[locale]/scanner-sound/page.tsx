/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { validateLocale } from "@/lib/i18n";
import { LOCALES } from "@/types";
import ScannerSoundScreen from "@/components/patient/ScannerSoundScreen";

// Static path generation
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
    title: `${(t as any).raw("scannerSound.title")} — ClarityScans`,
    description: "Listen to the sounds of a CT scanner",
  };
}

interface ScannerSoundPageProps {
  params: { locale: string };
}

// Main Page Component
export default async function ScannerSoundPage({ params }: ScannerSoundPageProps) {
  const locale = validateLocale(params.locale);
  if (!locale) notFound();

  // Set next-intl locale context
  unstable_setRequestLocale(locale);

  // Render the client component
  return <ScannerSoundScreen locale={locale} />;
}
