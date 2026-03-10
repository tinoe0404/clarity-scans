import { notFound } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { validateLocale } from "@/lib/i18n";
import { getVideosByLanguage } from "@/lib/queries/videos";
import type { VideoRecord } from "@/types";
import ModulesScreen from "@/components/patient/ModulesScreen";
import { LOCALES } from "@/types";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "app" });
  return {
    title: `${t("name")} - ${t("tagline")}`,
    description: t("tagline"),
  };
}

export default async function ModulesPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = validateLocale(params.locale);
  if (!locale) notFound();

  unstable_setRequestLocale(locale);

  let videos: VideoRecord[] = [];
  try {
    videos = await getVideosByLanguage(locale);
  } catch (err) {
    // Database transient error: absorb aggressively
    // Core patient loop continues flawlessly using hardcoded static fallbacks downstream
    console.error("Neon DB fetch failed inside /modules:", err);
  }

  return <ModulesScreen locale={locale} dbVideos={videos} />;
}
