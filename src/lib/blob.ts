import {
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getR2Client, R2_BUCKET_NAME, getR2PublicUrl } from "./r2";
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
import { mockBlobStorage } from "./blob.mock";

export const BlobPaths = {
  video: (locale: Locale, slug: VideoSlug): string => `videos/${locale}/${slug}.mp4`,
  thumbnail: (slug: VideoSlug): string => `thumbnails/${slug}.jpg`,
  tempUpload: (filename: string): string => `temp/${Date.now()}-${filename}`,
};

export const r2Storage = {
  async uploadVideo({
    file,
    locale,
    slug,
    contentType,
  }: UploadVideoParams): Promise<UploadVideoResult> {
    if (!ACCEPTED_VIDEO_TYPES.includes(contentType)) {
      throw new BlobValidationError("INVALID_TYPE", `Invalid video content type: ${contentType}`);
    }

    const isBuffer = Buffer.isBuffer(file);
    if (isBuffer && (file as Buffer).length > MAX_VIDEO_SIZE_BYTES) {
      throw new BlobValidationError(
        "FILE_TOO_LARGE",
        `Video exceeds maximum size of ${MAX_VIDEO_SIZE_BYTES / (1024 * 1024)}MB`
      );
    }

    try {
      const key = BlobPaths.video(locale, slug);
      const body = Buffer.isBuffer(file)
        ? file
        : Buffer.from(await streamToBuffer(file as ReadableStream));

      const client = getR2Client();
      await client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          Body: body,
          ContentType: contentType,
        })
      );

      const url = getR2PublicUrl(key);

      return {
        url,
        pathname: key,
        size: body.length,
        uploadedAt: new Date(),
      };
    } catch (err: unknown) {
      if (err instanceof BlobValidationError) throw err;
      throw new BlobValidationError(
        "UPLOAD_FAILED",
        err instanceof Error ? err.message : "Failed to upload video to R2"
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
      const key = BlobPaths.thumbnail(slug);
      const client = getR2Client();
      await client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          Body: file,
          ContentType: contentType,
        })
      );

      const url = getR2PublicUrl(key);

      return {
        url,
        pathname: key,
        size: file.length,
      };
    } catch (err: unknown) {
      if (err instanceof BlobValidationError) throw err;
      throw new BlobValidationError(
        "UPLOAD_FAILED",
        err instanceof Error ? err.message : "Failed to upload thumbnail to R2"
      );
    }
  },

  async deleteBlob(url: string): Promise<void> {
    try {
      // Extract the key from the public URL
      const key = extractKeyFromUrl(url);
      const client = getR2Client();
      await client.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
        })
      );
    } catch (err: unknown) {
      console.warn(
        `Warning: failed to delete R2 object ${url}`,
        err instanceof Error ? err.message : ""
      );
    }
  },

  async listVideos(locale?: Locale): Promise<BlobListResult[]> {
    const prefix = `videos/${locale ? locale + "/" : ""}`;
    const blobs: BlobListResult[] = [];

    const client = getR2Client();
    let continuationToken: string | undefined;

    do {
      const result = await client.send(
        new ListObjectsV2Command({
          Bucket: R2_BUCKET_NAME,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        })
      );

      if (result.Contents) {
        for (const obj of result.Contents) {
          if (obj.Key) {
            blobs.push({
              url: getR2PublicUrl(obj.Key),
              pathname: obj.Key,
              size: obj.Size ?? 0,
              uploadedAt: obj.LastModified ?? new Date(),
            });
          }
        }
      }

      continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
    } while (continuationToken);

    return blobs;
  },

  async listThumbnails(): Promise<BlobListResult[]> {
    const prefix = `thumbnails/`;
    const blobs: BlobListResult[] = [];

    const client = getR2Client();
    let continuationToken: string | undefined;

    do {
      const result = await client.send(
        new ListObjectsV2Command({
          Bucket: R2_BUCKET_NAME,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        })
      );

      if (result.Contents) {
        for (const obj of result.Contents) {
          if (obj.Key) {
            blobs.push({
              url: getR2PublicUrl(obj.Key),
              pathname: obj.Key,
              size: obj.Size ?? 0,
              uploadedAt: obj.LastModified ?? new Date(),
            });
          }
        }
      }

      continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
    } while (continuationToken);

    return blobs;
  },

  async videoExists(locale: Locale, slug: VideoSlug): Promise<boolean> {
    const key = BlobPaths.video(locale, slug);
    try {
      const client = getR2Client();
      await client.send(
        new HeadObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
        })
      );
      return true;
    } catch {
      return false;
    }
  },

  async getStorageStats(): Promise<StorageStats> {
    let totalBytes = 0;
    let videoCount = 0;
    let thumbnailCount = 0;

    const client = getR2Client();
    let continuationToken: string | undefined;

    do {
      const result = await client.send(
        new ListObjectsV2Command({
          Bucket: R2_BUCKET_NAME,
          ContinuationToken: continuationToken,
        })
      );

      if (result.Contents) {
        for (const obj of result.Contents) {
          totalBytes += obj.Size ?? 0;
          if (obj.Key?.startsWith("videos/")) videoCount++;
          if (obj.Key?.startsWith("thumbnails/")) thumbnailCount++;
        }
      }

      continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
    } while (continuationToken);

    return {
      totalBytes,
      totalMB: totalBytes / (1024 * 1024),
      videoCount,
      thumbnailCount,
      percentUsed: totalBytes / FREE_TIER_LIMIT_BYTES,
      freetierLimitGB: 10,
    };
  },
};

// --- Helper: Extract R2 key from a public URL ---
function extractKeyFromUrl(url: string): string {
  const publicUrl = process.env.R2_PUBLIC_URL || "";
  if (publicUrl && url.startsWith(publicUrl)) {
    const base = publicUrl.endsWith("/") ? publicUrl : publicUrl + "/";
    return url.slice(base.length);
  }
  // Fallback: try to extract path after domain
  try {
    const parsed = new URL(url);
    return parsed.pathname.startsWith("/") ? parsed.pathname.slice(1) : parsed.pathname;
  } catch {
    return url;
  }
}

// --- Helper: Stream to Buffer ---
async function streamToBuffer(stream: ReadableStream): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

// --- Storage Auto-Selector ---

let selectedStorage = r2Storage;

if (!process.env.R2_ACCESS_KEY_ID) {
  if (process.env.NODE_ENV === "development") {
    console.warn("⚠️ R2_ACCESS_KEY_ID not set. Running R2 storage in MOCK mode.");
    selectedStorage = mockBlobStorage;
  } else if (process.env.NODE_ENV === "production") {
    throw new Error(
      "CRITICAL: R2_ACCESS_KEY_ID is not set in production. " +
        "You must add R2 credentials to your environment variables. " +
        "See the Cloudflare R2 setup guide for details."
    );
  }
}

export const storage = selectedStorage;
