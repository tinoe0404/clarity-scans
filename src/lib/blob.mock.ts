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

export const USE_MOCK_BLOB = !process.env.BLOB_READ_WRITE_TOKEN;

// Local in-memory map for mock storage
interface MockBlobData {
  url: string;
  pathname: string;
  data: Buffer;
  size: number;
  uploadedAt: Date;
}
const mockStore = new Map<string, MockBlobData>();

// Seed with 5 placeholders for development viewing
const SEED_SLUGS: VideoSlug[] = [
  "what-is-ct",
  "prepare",
  "breathhold",
  "contrast",
  "staying-still",
];
SEED_SLUGS.forEach((slug) => {
  const pathname = `videos/en/${slug}.mp4`;
  mockStore.set(pathname, {
    url: "PLACEHOLDER",
    pathname,
    data: Buffer.from([]),
    size: 0,
    uploadedAt: new Date(),
  });
});

export const mockBlobStorage = {
  async uploadVideo({
    file,
    locale,
    slug,
    contentType,
  }: UploadVideoParams): Promise<UploadVideoResult> {
    if (!ACCEPTED_VIDEO_TYPES.includes(contentType)) {
      throw new BlobValidationError("INVALID_TYPE", `Invalid video content type: ${contentType}`);
    }

    // In mock, assume file is Buffer for simplicity of size checking
    const buffer = Buffer.isBuffer(file)
      ? file
      : Buffer.from(await streamToBuffer(file as ReadableStream));

    if (buffer.length > MAX_VIDEO_SIZE_BYTES) {
      throw new BlobValidationError(
        "FILE_TOO_LARGE",
        `Video exceeds maximum size of ${MAX_VIDEO_SIZE_BYTES / (1024 * 1024)}MB`
      );
    }

    const pathname = `videos/${locale}/${slug}.mp4`;
    const url = `http://localhost:3000/mock-blob/${pathname}`;

    mockStore.set(pathname, {
      url,
      pathname,
      data: buffer,
      size: buffer.length,
      uploadedAt: new Date(),
    });

    return { url, pathname, size: buffer.length, uploadedAt: new Date() };
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

    const pathname = `thumbnails/${slug}.jpg`;
    const url = `http://localhost:3000/mock-blob/${pathname}`;

    mockStore.set(pathname, {
      url,
      pathname,
      data: file,
      size: file.length,
      uploadedAt: new Date(),
    });

    return { url, pathname, size: file.length };
  },

  async deleteBlob(url: string): Promise<void> {
    const entry = Array.from(mockStore.entries()).find(([, v]) => v.url === url);
    if (entry) {
      mockStore.delete(entry[0]);
    } else {
      console.warn(`Attempted to delete non-existent mock blob: ${url}`);
    }
  },

  async listVideos(locale?: Locale): Promise<BlobListResult[]> {
    const prefix = `videos/${locale ?? ""}`;
    return Array.from(mockStore.values())
      .filter((v) => v.pathname.startsWith(prefix))
      .map((v) => ({ url: v.url, pathname: v.pathname, size: v.size, uploadedAt: v.uploadedAt }));
  },

  async listThumbnails(): Promise<BlobListResult[]> {
    const prefix = `thumbnails/`;
    return Array.from(mockStore.values())
      .filter((v) => v.pathname.startsWith(prefix))
      .map((v) => ({ url: v.url, pathname: v.pathname, size: v.size, uploadedAt: v.uploadedAt }));
  },

  async videoExists(locale: Locale, slug: VideoSlug): Promise<boolean> {
    const pathname = `videos/${locale}/${slug}.mp4`;
    return mockStore.has(pathname);
  },

  async getStorageStats(): Promise<StorageStats> {
    const all = Array.from(mockStore.values());
    const totalBytes = all.reduce((sum, item) => sum + item.size, 0);
    const videoCount = all.filter((item) => item.pathname.startsWith("videos/")).length;
    const thumbnailCount = all.filter((item) => item.pathname.startsWith("thumbnails/")).length;

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
