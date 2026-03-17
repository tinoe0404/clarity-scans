/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { validateLocale } from "@/lib/i18n";
import { LOCALES } from "@/types";
import ContrastGuideScreen from "@/components/patient/ContrastGuideScreen";

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
    title: `${(t as any).raw("contrastGuide.title")} — ClarityScans`,
    description: "Learn what to expect during a contrast injection",
  };
}

interface ContrastGuidePageProps {
  params: { locale: string };
}

// Main Page Component
export default async function ContrastGuidePage({ params }: ContrastGuidePageProps) {
  const locale = validateLocale(params.locale);
  if (!locale) notFound();

  // Set next-intl locale context
  unstable_setRequestLocale(locale);

  // Render the client component
  return <ContrastGuideScreen locale={locale} />;
}
