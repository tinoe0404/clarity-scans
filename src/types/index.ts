// Locales
export type Locale = "en" | "sn" | "nd";
export const LOCALES: Locale[] = ["en", "sn", "nd"];
export const DEFAULT_LOCALE: Locale = "en";

// Video module slugs
export type VideoSlug = "what-is-ct" | "prepare" | "breathhold" | "contrast" | "staying-still";

// DB record types (matching schema from future Phase 3)
export interface VideoRecord {
  id: string;
  slug: VideoSlug;
  language: Locale;
  title: string;
  description: string;
  blob_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  sort_order: number;
  is_active: boolean;
  uploaded_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface SessionRecord {
  id: string;
  language: Locale;
  started_at: Date;
  completed_modules: VideoSlug[];
  device_type: "tablet" | "phone" | "unknown";
}

export interface FeedbackRecord {
  id: string;
  session_id: string;
  understood_procedure: boolean | null;
  anxiety_before: 1 | 2 | 3 | 4 | 5 | null;
  anxiety_after: 1 | 2 | 3 | 4 | 5 | null;
  app_helpful: boolean | null;
  comments: string | null;
  submitted_by: "patient" | "radiographer";
  created_at: Date;
}

export interface RadioNoteRecord {
  id: string;
  session_id: string;
  followed_breathhold: boolean;
  repeat_scan_required: boolean;
  language_used: Locale;
  comments: string | null;
  created_at: Date;
}

// API response wrappers
export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; error: string; code?: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Blob Storage Upload Types
export interface UploadVideoParams {
  file: Buffer | ReadableStream;
  locale: Locale;
  slug: VideoSlug;
  contentType: "video/mp4" | "video/webm";
}

export interface UploadVideoResult {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
}

export interface UploadThumbnailParams {
  file: Buffer;
  slug: VideoSlug;
  contentType: "image/jpeg" | "image/png" | "image/webp";
}

export interface UploadThumbnailResult {
  url: string;
  pathname: string;
  size: number;
}

export interface BlobListResult {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
}

export interface StorageStats {
  totalBytes: number;
  totalMB: number;
  videoCount: number;
  thumbnailCount: number;
  percentUsed: number;
  freetierLimitGB: number;
}
