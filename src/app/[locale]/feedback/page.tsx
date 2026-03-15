/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { validateLocale } from "@/lib/i18n";
import { LOCALES } from "@/types";
import FeedbackScreen from "@/components/patient/FeedbackScreen";

// Static path generation
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

// Localized SEO
export async function generateMetadata({ params }: { params: { locale: string } }) {
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

// Main Page Component
export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const locale = validateLocale(params.locale);
  if (!locale) notFound();

  // Set next-intl locale context
  unstable_setRequestLocale(locale);

  // Render the client component
  return <FeedbackScreen locale={locale} />;
}
