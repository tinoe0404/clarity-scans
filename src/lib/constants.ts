import { VideoSlug, Locale } from "@/types";

export const MAX_VIDEO_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
export const MAX_THUMBNAIL_SIZE_BYTES = 500 * 1024; // 500KB

export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"] as const;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const FREE_TIER_LIMIT_BYTES = 10 * 1024 * 1024 * 1024; // 10GB (Cloudflare R2 free tier)
export const STORAGE_WARNING_THRESHOLD = 0.8; // Warn at 80% usage

export const VIDEO_MODULE_SLUGS: readonly VideoSlug[] = [
  "what-is-ct",
  "prepare",
  "breathhold",
  "contrast",
  "staying-still",
] as const;

export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "sn", "nd"] as const;

export const BREATH_HOLD_REPS = 3;
export const BREATH_HOLD_TIMING = {
  inhale: 3000,
  hold: 7000,
  exhale: 3000,
  rest: 3000,
} as const;
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// HIT 300 project benchmark targets
export const HELPFUL_TARGET = 0.80; // 80% target for "App Helpful"
export const UNDERSTOOD_TARGET = 0.70; // 70% target for "Understood Procedure"

// Network Timeouts
export const API_TIMEOUT_MS = 10000;
export const UPLOAD_TIMEOUT_MS = 120000;
export const SESSION_SYNC_TIMEOUT_MS = 5000;
export const DB_HEALTH_TIMEOUT_MS = 3000;

// Blob Retry constants
export const BLOB_MAX_RETRIES = 3;
export const BLOB_INITIAL_RETRY_MS = 1000;

