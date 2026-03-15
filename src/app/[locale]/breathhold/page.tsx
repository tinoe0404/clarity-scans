/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { validateLocale } from "@/lib/i18n";
import { LOCALES } from "@/types";
import nextDynamic from "next/dynamic";

const BreathHoldScreen = nextDynamic(() => import("@/components/patient/BreathHoldScreen"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-surface-base">
      <div className="h-12 w-12 animate-pulse rounded-full bg-slate-800" />
    </div>
  ),
});

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
    title: `${(t as any).raw("breathhold.title")} — ClarityScans`,
    description: "Interactive CT Scan breath hold trainer",
  };
}

interface BreathHoldPageProps {
  params: { locale: string };
}

// Main Page Component
export default async function BreathHoldPage({ params }: BreathHoldPageProps) {
  const locale = validateLocale(params.locale);
  if (!locale) notFound();

  // Set next-intl locale context
  unstable_setRequestLocale(locale);

  // Render the client component
  return <BreathHoldScreen locale={locale} />;
}
