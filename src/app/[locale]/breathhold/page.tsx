/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { validateLocale } from "@/lib/i18n";
import { LOCALES } from "@/types";
import dynamic from "next/dynamic";

const BreathHoldScreen = dynamic(() => import("@/components/patient/BreathHoldScreen"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-surface-base">
      <div className="h-12 w-12 animate-pulse rounded-full bg-slate-800" />
    </div>
  ),
});

// 1. Fully static offline path generation
export const dynamic = "force-static";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

// 2. Localized SEO & Shell boundaries
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
