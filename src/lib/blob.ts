import { put, del, list, getDownloadUrl } from "@vercel/blob";
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
  ACCEPTED_VIDEO_TYPES,
  ACCEPTED_IMAGE_TYPES,
  FREE_TIER_LIMIT_BYTES,
} from "./constants";

export const BlobPaths = {
  video: (locale: Locale, slug: VideoSlug): string => `videos/${locale}/${slug}.mp4`,
  thumbnail: (slug: VideoSlug): string => `thumbnails/${slug}.jpg`,
  tempUpload: (filename: string): string => `temp/${Date.now()}-${filename}`,
};

export const storage = {
  async uploadVideo({
    file,
    locale,
    slug,
    contentType,
  }: UploadVideoParams): Promise<UploadVideoResult> {
    if (!ACCEPTED_VIDEO_TYPES.includes(contentType)) {
      throw new BlobValidationError("INVALID_TYPE", `Invalid video content type: ${contentType}`);
    }

    try {
      const key = BlobPaths.video(locale, slug);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await put(key, file as any, {
        access: "private",
        contentType,
        multipart: true,
      });

      return {
        url: blob.url,
        pathname: blob.pathname,
        size: 0, // Vercel Blob upload response does not include size immediately
        uploadedAt: new Date(),
      };
    } catch (err: unknown) {
      if (err instanceof BlobValidationError) throw err;
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

    try {
      const key = BlobPaths.thumbnail(slug);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await put(key, file as any, {
        access: "private",
        contentType,
      });

      return {
        url: blob.url,
        pathname: blob.pathname,
        size: 0,
      };
    } catch (err: unknown) {
      if (err instanceof BlobValidationError) throw err;
      throw new BlobValidationError(
        "UPLOAD_FAILED",
        err instanceof Error ? err.message : "Failed to upload thumbnail"
      );
    }
  },

  async deleteBlob(url: string): Promise<void> {
    try {
      await del(url);
    } catch (err: unknown) {
      console.warn(`Warning: failed to delete object ${url}`, err);
    }
  },

  async listVideos(locale?: Locale): Promise<BlobListResult[]> {
    const prefix = `videos/${locale ? locale + "/" : ""}`;
    const { blobs } = await list({ prefix });

    return blobs.map((b) => ({
      url: b.url,
      pathname: b.pathname,
      size: b.size,
      uploadedAt: b.uploadedAt,
    }));
  },

  async listThumbnails(): Promise<BlobListResult[]> {
    const prefix = `thumbnails/`;
    const { blobs } = await list({ prefix });

    return blobs.map((b) => ({
      url: b.url,
      pathname: b.pathname,
      size: b.size,
      uploadedAt: b.uploadedAt,
    }));
  },

  async videoExists(locale: Locale, slug: VideoSlug): Promise<boolean> {
    const key = BlobPaths.video(locale, slug);
    try {
      const { blobs } = await list({ prefix: key, limit: 1 });
      return blobs.some((b) => b.pathname === key);
    } catch {
      return false;
    }
  },

  async getStorageStats(): Promise<StorageStats> {
    let totalBytes = 0;
    let videoCount = 0;
    let thumbnailCount = 0;

    let cursor: string | undefined;
    do {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const options: any = { limit: 1000 };
      if (cursor) options.cursor = cursor;
      const result = await list(options) as unknown as { blobs: { size: number, pathname: string }[], cursor?: string };
      for (const obj of result.blobs) {
        totalBytes += obj.size;
        if (obj.pathname?.startsWith("videos/")) videoCount++;
        if (obj.pathname?.startsWith("thumbnails/")) thumbnailCount++;
      }
      cursor = result.cursor;
    } while (cursor);

    return {
      totalBytes,
      totalMB: totalBytes / (1024 * 1024),
      videoCount,
      thumbnailCount,
      percentUsed: totalBytes / FREE_TIER_LIMIT_BYTES,
      freetierLimitGB: FREE_TIER_LIMIT_BYTES / (1024 * 1024 * 1024),
    };
  },

  /**
   * Generate a signed download URL for a private blob.
   * Returns the original URL as fallback if generation fails.
   */
  async resolveDownloadUrl(blobUrl: string): Promise<string> {
    if (!blobUrl || blobUrl === "PLACEHOLDER") return blobUrl;
    try {
      return await getDownloadUrl(blobUrl);
    } catch {
      // Fallback to raw URL if token generation fails
      return blobUrl;
    }
  },

  /**
   * Resolve download URLs for a VideoRecord's blob_url and thumbnail_url.
   * Use this before sending records to the client.
   */
  async resolveVideoUrls<T extends { blob_url: string; thumbnail_url: string | null }>(
    record: T
  ): Promise<T> {
    const [downloadUrl, thumbUrl] = await Promise.all([
      record.blob_url ? storage.resolveDownloadUrl(record.blob_url) : Promise.resolve(record.blob_url),
      record.thumbnail_url ? storage.resolveDownloadUrl(record.thumbnail_url) : Promise.resolve(null),
    ]);
    return { ...record, blob_url: downloadUrl, thumbnail_url: thumbUrl };
  },

  /**
   * Resolve download URLs for an array of VideoRecords.
   */
  async resolveVideoUrlsBatch<T extends { blob_url: string; thumbnail_url: string | null }>(
    records: T[]
  ): Promise<T[]> {
    return Promise.all(records.map((r) => storage.resolveVideoUrls(r)));
  },
};
