import type { VideoSlug, VideoRecord, Locale } from "@/types";

export interface ModuleRegistryEntry {
  slug: VideoSlug;
  icon: string;
  accentColor: string;
  isImportant: boolean;
  sortOrder: number;
  defaultDurationSeconds: number;
}

export const MODULE_REGISTRY: ModuleRegistryEntry[] = [
  {
    slug: "what-is-ct",
    icon: "🔬",
    accentColor: "#0ea5e9", // Sky 500
    isImportant: false,
    sortOrder: 1,
    defaultDurationSeconds: 120, // 2:00
  },
  {
    slug: "prepare",
    icon: "✅",
    accentColor: "#22c55e", // Green 500
    isImportant: false,
    sortOrder: 2,
    defaultDurationSeconds: 120,
  },
  {
    slug: "breathhold",
    icon: "🫁",
    accentColor: "#f97316", // Orange 500
    isImportant: true, // gets "Important" amber badge
    sortOrder: 3,
    defaultDurationSeconds: 120,
  },
  {
    slug: "contrast",
    icon: "💉",
    accentColor: "#a855f7", // Purple 500
    isImportant: false,
    sortOrder: 4,
    defaultDurationSeconds: 60, // 1:00
  },
  {
    slug: "staying-still",
    icon: "🧘",
    accentColor: "#eab308", // Yellow 500
    isImportant: false,
    sortOrder: 5,
    defaultDurationSeconds: 60,
  },
];

export function getModuleBySlug(slug: VideoSlug): ModuleRegistryEntry | undefined {
  return MODULE_REGISTRY.find((m) => m.slug === slug);
}

export interface MergedModule {
  slug: VideoSlug;
  icon: string;
  accentColor: string;
  isImportant: boolean;
  sortOrder: number;
  title?: string;
  description?: string;
  durationSeconds: number;
  hasVideo: boolean;
  blobUrl: string | null;
  thumbnailUrl: string | null;
  isWatched: boolean;
}

/**
 * Pure function: joins static structure with Neon DB records mapping to available UI state.
 * Always returns exactly 5 entries matching the sortOrder from the registry.
 */
export function mergeModuleData(
  registry: ModuleRegistryEntry[],
  dbVideos: VideoRecord[],
  locale: Locale
): MergedModule[] {
  return registry.map((reg) => {
    // 1. Find matching video for this exact slug + locale in DB records
    const matchedVideo = dbVideos.find((v) => v.slug === reg.slug && v.language === locale);

    // 2. Static fallback: always try the local public/videos/{locale}/{slug}.mp4 path
    const staticUrl = `/videos/${locale}/${reg.slug}.mp4`;

    // 3. Determine the blob URL: prefer DB record, then fall back to static file
    const blobUrl = matchedVideo?.blob_url || staticUrl;

    // 4. For sn/nd we always have static videos; for en we only have video if DB says so
    const hasVideo = !!matchedVideo?.is_active || locale === "sn" || locale === "nd";

    // 5. Duration from DB or default
    const durationSeconds = matchedVideo?.duration_seconds ?? reg.defaultDurationSeconds;

    const base = {
      slug: reg.slug,
      icon: reg.icon,
      accentColor: reg.accentColor,
      isImportant: reg.isImportant,
      sortOrder: reg.sortOrder,
      durationSeconds,
      hasVideo,
      blobUrl: hasVideo ? blobUrl : null,
      thumbnailUrl: matchedVideo?.thumbnail_url ?? null,
      isWatched: false,
    };

    const result: MergedModule = { ...base };
    if (matchedVideo?.title) result.title = matchedVideo.title;
    if (matchedVideo?.description) result.description = matchedVideo.description;

    return result;
  });
}

/**
 * pure fn: scans sequence map marking the immediate next un-completed target.
 */
export function getNextUnwatchedSlug(watchedModules: VideoSlug[]): VideoSlug | null {
  for (const mod of MODULE_REGISTRY) {
    if (!watchedModules.includes(mod.slug)) {
      return mod.slug;
    }
  }
  return null; // All done
}
