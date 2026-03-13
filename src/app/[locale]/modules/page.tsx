import { notFound } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { validateLocale } from "@/lib/i18n";
import { getVideosByLanguage } from "@/lib/queries/videos";
import type { VideoRecord } from "@/types";
import { MODULE_REGISTRY, mergeModuleData } from "@/lib/moduleRegistry";
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
    console.error("Neon DB fetch failed inside /modules:", err);
  }

  const t = await getTranslations({ locale, namespace: "modules" });
  let mergedModules = mergeModuleData(MODULE_REGISTRY, videos, locale);
  // Inject translations on the server side to shrink client bundle
  mergedModules = mergedModules.map((mod) => ({
    ...mod,
    title: mod.title || t(`slugs.${mod.slug}.title`),
    description: mod.description || t(`slugs.${mod.slug}.description`),
  }));

  return <ModulesScreen locale={locale} mergedModules={mergedModules} />;
}
