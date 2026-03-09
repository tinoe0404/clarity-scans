import { put, del, list, type ListBlobResultBlob } from "@vercel/blob";
import {
  Locale,
  VideoSlug,
  BlobListResult,
  UploadVideoParams,
  UploadVideoResult,
  UploadThumbnailParams,
  UploadThumbnailResult,
  StorageStats,
} from "@/types";
import { BlobValidationError } from "./errors";
import {
  MAX_VIDEO_SIZE_BYTES,
  MAX_THUMBNAIL_SIZE_BYTES,
  ACCEPTED_VIDEO_TYPES,
  ACCEPTED_IMAGE_TYPES,
  FREE_TIER_LIMIT_BYTES,
} from "./constants";
import { isBlobUrl } from "./utils";
import { mockBlobStorage } from "./blob.mock";

export const BlobPaths = {
  video: (locale: Locale, slug: VideoSlug): string => `videos / ${locale}/${slug}.mp4`,
  thumbnail: (slug: VideoSlug): string => `thumbnails/${slug}.jpg`,
  tempUpload: (filename: string): string => `temp/${Date.now()}-${filename}`,
};

export const blobStorage = {
  async uploadVideo({
    file,
    locale,
    slug,
    contentType,
  }: UploadVideoParams): Promise<UploadVideoResult> {
    if (!ACCEPTED_VIDEO_TYPES.includes(contentType)) {
      throw new BlobValidationError("INVALID_TYPE", `Invalid video content type: ${contentType}`);
    }

    // Size validation - Note: for Streams this is optimistic padding, relying on Vercel's limits too
    const isBuffer = Buffer.isBuffer(file);
    if (isBuffer && (file as Buffer).length > MAX_VIDEO_SIZE_BYTES) {
      throw new BlobValidationError(
        "FILE_TOO_LARGE",
        `Video exceeds maximum size of ${MAX_VIDEO_SIZE_BYTES / (1024 * 1024)}MB`
      );
    }

    try {
      const pathname = BlobPaths.video(locale, slug);
      const rawBlob = await put(pathname, file as unknown as File, {
        access: "public",
        addRandomSuffix: false,
        contentType: contentType,
      });
      const blob = rawBlob as unknown as {
        url: string;
        pathname: string;
        size: number;
        uploadedAt: Date;
      };

      return {
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size ?? 0,
        uploadedAt: blob.uploadedAt ?? new Date(),
      };
    } catch (err: unknown) {
      throw new BlobValidationError(
        "UPLOAD_FAILED",
        err instanceof Error ? err.message : "Failed to upload video"
      );
    }
  },

  async uploadThumbnail({
    file,
    slug,
    contentType,
  }: UploadThumbnailParams): Promise<UploadThumbnailResult> {
    if (!ACCEPTED_IMAGE_TYPES.includes(contentType)) {
      throw new BlobValidationError("INVALID_TYPE", `Invalid image content type: ${contentType}`);
    }

    if (file.length > MAX_THUMBNAIL_SIZE_BYTES) {
      throw new BlobValidationError(
        "FILE_TOO_LARGE",
        `Thumbnail exceeds maximum size of ${MAX_THUMBNAIL_SIZE_BYTES / 1024}KB`
      );
    }

    try {
      const pathname = BlobPaths.thumbnail(slug);
      const rawBlob = await put(pathname, file, {
        access: "public",
        addRandomSuffix: false,
        contentType: contentType,
      });
      const blob = rawBlob as unknown as { url: string; pathname: string; size: number };

      return {
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size ?? 0,
      };
    } catch (err: unknown) {
      throw new BlobValidationError(
        "UPLOAD_FAILED",
        err instanceof Error ? err.message : "Failed to upload thumbnail"
      );
    }
  },

  async deleteBlob(url: string): Promise<void> {
    if (!isBlobUrl(url)) {
      throw new BlobValidationError(
        "INVALID_URL",
        "Cannot delete blob: not a valid Vercel Blob URL"
      );
    }

    try {
      await del(url);
    } catch (err: unknown) {
      console.warn(
        `Warning: failed to delete blob ${url}`,
        err instanceof Error ? err.message : ""
      );
    }
  },

  async listVideos(locale?: Locale): Promise<BlobListResult[]> {
    const prefix = `videos/${locale ? locale + "/" : ""}`;
    const blobs: BlobListResult[] = [];

    let hasMore = true;
    let cursor: string | undefined;

    while (hasMore) {
      const options: { prefix: string; cursor?: string } = { prefix };
      if (cursor) options.cursor = cursor;

      const listResult = await list(options);
      blobs.push(
        ...listResult.blobs.map((b) => ({
          url: b.url,
          pathname: b.pathname,
          size: b.size,
          uploadedAt: b.uploadedAt,
        }))
      );
      hasMore = listResult.hasMore;
      cursor = listResult.cursor;
    }

    return blobs;
  },

  async listThumbnails(): Promise<BlobListResult[]> {
    const prefix = `thumbnails/`;
    const blobs: BlobListResult[] = [];

    let hasMore = true;
    let cursor: string | undefined;

    while (hasMore) {
      const options: { prefix: string; cursor?: string } = { prefix };
      if (cursor) options.cursor = cursor;

      const listResult = await list(options);
      blobs.push(
        ...listResult.blobs.map((b: ListBlobResultBlob) => ({
          url: b.url,
          pathname: b.pathname,
          size: b.size,
          uploadedAt: b.uploadedAt,
        }))
      );
      hasMore = listResult.hasMore;
      cursor = listResult.cursor;
    }

    return blobs;
  },

  async videoExists(locale: Locale, slug: VideoSlug): Promise<boolean> {
    const pathname = BlobPaths.video(locale, slug);
    try {
      // head expects url, since we don't have url we fetch list with prefix
      const result = await list({ prefix: pathname, limit: 1 });
      return result.blobs.length > 0 && result.blobs[0]?.pathname === pathname;
    } catch {
      return false;
    }
  },

  async getStorageStats(): Promise<StorageStats> {
    let hasMore = true;
    let cursor: string | undefined;
    let totalBytes = 0;
    let videoCount = 0;
    let thumbnailCount = 0;

    // List all to calculate total sizes (acceptable for < 20 files total)
    while (hasMore) {
      const options: { cursor?: string } = {};
      if (cursor) options.cursor = cursor;

      const listResult = await list(options);
      for (const b of listResult.blobs) {
        totalBytes += b.size;
        if (b.pathname.startsWith("videos/")) videoCount++;
        if (b.pathname.startsWith("thumbnails/")) thumbnailCount++;
      }
      hasMore = listResult.hasMore;
      cursor = listResult.cursor;
    }

    return {
      totalBytes,
      totalMB: totalBytes / (1024 * 1024),
      videoCount,
      thumbnailCount,
      percentUsed: totalBytes / FREE_TIER_LIMIT_BYTES,
      freetierLimitGB: 1,
    };
  },
};

// --- Storage Auto-Selector ---

let selectedStorage = blobStorage;

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  if (process.env.NODE_ENV === "development") {
    console.warn("⚠️ BLOB_READ_WRITE_TOKEN not set. Running Vercel Blob storage in MOCK mode.");
    selectedStorage = mockBlobStorage;
  } else if (process.env.NODE_ENV === "production") {
    throw new Error(
      "CRITICAL: BLOB_READ_WRITE_TOKEN is not set in production. " +
        "You must add this token to your Vercel project environment variables via the Vercel Dashboard Storage tab."
    );
  }
}

export const storage = selectedStorage;
