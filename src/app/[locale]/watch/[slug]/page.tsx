/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { validateLocale } from "@/lib/i18n";
import { getVideoBySlug } from "@/lib/queries/videos";
import { storage } from "@/lib/blob";
import { getModuleBySlug } from "@/lib/moduleRegistry";
import type { VideoSlug, VideoRecord } from "@/types";
import { LOCALES } from "@/types";
import VideoPlayerScreen from "@/components/patient/VideoPlayerScreen";

// 1. Fully static path generation enabling maximum offline delivery potential
export function generateStaticParams() {
  const slugs: VideoSlug[] = ["what-is-ct", "prepare", "breathhold", "contrast", "staying-still"];
  const params: { locale: string; slug: string }[] = [];

  for (const locale of LOCALES) {
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }
  return params;
}

// 2. Localized SEO & Shell mapping
export async function generateMetadata({ params }: { params: { locale: string; slug: string } }) {
  const locale = validateLocale(params.locale);
  if (!locale) return {};

  const moduleDef = getModuleBySlug(params.slug as VideoSlug);
  if (!moduleDef) return {};

  const t = await getTranslations({ locale });
  // Try retrieving explicit title from localized tree
  let titleStr = "ClarityScans";
  try {
    titleStr = (t as any).raw(`modules.slugs.${params.slug}.title`);
  } catch {
    // Fallback if translations lag behind slug additions natively
  }

  return {
    title: `${titleStr} — ClarityScans`,
    description: "Patient education module",
  };
}

interface WatchPageProps {
  params: { locale: string; slug: string };
}

// 3. Primary Server Execution Block
export default async function WatchPage({ params }: WatchPageProps) {
  // Validate locale boundary
  const locale = validateLocale(params.locale);
  if (!locale) notFound();

  // Next-Intl propagation requirement
  unstable_setRequestLocale(locale);

  // Validate slug exists in static registry mapping
  const slugTarget = params.slug as VideoSlug;
  const registryEntry = getModuleBySlug(slugTarget);
  if (!registryEntry) notFound();

  // Attempt retrieving live VideoRecord overriding text bounds gracefully
  let videoRecord: VideoRecord | null = null;
  try {
    const raw = await getVideoBySlug(slugTarget, locale);
    // Resolve signed download URLs for private blob store
    videoRecord = raw ? await storage.resolveVideoUrls(raw) : null;
  } catch (error) {
    console.error("Database connection fault hitting /watch:", error);
  }

  const t = await getTranslations({ locale });
  
  let title = videoRecord?.title;
  try {
    const tTitle = (t as any).raw(`modules.slugs.${slugTarget}.title`);
    if (tTitle) title = tTitle;
  } catch {}

  let description = videoRecord?.description;
  try {
    const tDesc = (t as any).raw(`modules.slugs.${slugTarget}.description`);
    if (tDesc) description = tDesc;
  } catch {}
  
  // Extract keypoints array
  let keyPoints: string[] = [];
  try {
    const p = (t as any).raw(`video.keypoints.${slugTarget}`);
    if (Array.isArray(p)) keyPoints = p;
  } catch {}

  return (
    <VideoPlayerScreen
      locale={locale}
      slug={slugTarget}
      videoRecord={videoRecord}
      registryEntry={registryEntry}
      serverTitle={title || ""}
      serverDescription={description || ""}
      serverKeyPoints={keyPoints}
    />
  );
}
