import { notFound } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { validateLocale } from "@/lib/i18n";
import { getVideosByLanguage } from "@/lib/queries/videos";
import { storage } from "@/lib/blob";
import type { VideoRecord } from "@/types";
import { MODULE_REGISTRY, mergeModuleData } from "@/lib/moduleRegistry";
import ModulesScreen from "@/components/patient/ModulesScreen";

export const dynamic = 'force-dynamic';

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
    const rawVideos = await getVideosByLanguage(locale);
    // Resolve signed download URLs for private blob store
    videos = await storage.resolveVideoUrlsBatch(rawVideos);
  } catch (err) {
    console.error("Neon DB fetch failed inside /modules:", err);
  }

  const t = await getTranslations({ locale, namespace: "modules" });
  let mergedModules = mergeModuleData(MODULE_REGISTRY, videos, locale);
  // Inject translations on the server side to shrink client bundle
  mergedModules = mergedModules.map((mod) => {
    // Attempt to get the translation. If it returns the dot-notation key or throws, fallback to DB.
    let localTitle = mod.title;
    let localDesc = mod.description;
    
    try {
      const tTitle = t(`slugs.${mod.slug}.title`);
      if (tTitle && tTitle !== `slugs.${mod.slug}.title`) localTitle = tTitle;
      
      const tDesc = t(`slugs.${mod.slug}.description`);
      if (tDesc && tDesc !== `slugs.${mod.slug}.description`) localDesc = tDesc;
    } catch {
      // Ignore missing translation errors
    }

    return {
      ...mod,
      title: localTitle || "",
      description: localDesc || "",
    };
  });

  return <ModulesScreen locale={locale} mergedModules={mergedModules} />;
}
