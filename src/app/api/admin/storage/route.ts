import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { storage } from "@/lib/blob";
import { getAllVideos } from "@/lib/queries/videos";
import { logUploadAction } from "@/lib/queries/uploadLog";
import { isBlobUrl } from "@/lib/utils";
import { handleApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Storage Stats map total bytes directly across the Blob Array
    const [videos, storageStats, dbRecordsRaw] = await Promise.all([
      storage.listVideos(),
      storage.getStorageStats(),
      getAllVideos(false), // Fetches EVERY video natively inc Inactive variants
    ]);

    const activeDbUrls = new Set<string>();
    const inactiveDbUrls = new Set<string>();

    dbRecordsRaw.forEach((record) => {
      if (record.is_active) {
        activeDbUrls.add(record.video_url);
      } else {
        inactiveDbUrls.add(record.video_url);
      }
    });

    const orphanedBlobs: string[] = [];
    const inactiveBlobs: string[] = [];

    videos.forEach((blob) => {
      if (!activeDbUrls.has(blob.url) && !inactiveDbUrls.has(blob.url)) {
        // Exists completely unlinked mapping!
        orphanedBlobs.push(blob.url);
      } else if (inactiveDbUrls.has(blob.url)) {
        inactiveBlobs.push(blob.url);
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          totalBlobs: videos.length,
          orphanedBlobs,
          inactiveBlobs,
          storageStats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const apiErr = handleApiError(error);
    return NextResponse.json(
      { success: false, error: apiErr.message },
      { status: apiErr.statusCode }
    );
  } finally {
    logger.info("Admin Storage Audit Execution", {
      method: "GET",
      path: request.nextUrl.pathname,
      durationMs: Date.now() - startTime,
    });
  }
}

// Map Delete URL boundary schema safely isolating injection routines naturally
const bulkDeleteSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(25),
});

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session || !session.user?.name) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = bulkDeleteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: "Invalid URLs payload" }, { status: 400 });
    }

    const targetUrls = validation.data.urls;

    // Must explicitly enforce DB verification stopping live video purges!
    const dbRecordsRaw = await getAllVideos(false);
    const allBoundUrls = new Set(dbRecordsRaw.map((r) => r.video_url));

    const successful: string[] = [];
    const failed: string[] = [];

    for (const url of targetUrls) {
      if (!isBlobUrl(url)) {
        failed.push(`${url} (Invalid Blob Format)`);
        continue;
      }

      if (allBoundUrls.has(url)) {
        failed.push(`${url} (Protected by Active DB Linking)`);
        await logUploadAction({
          action: "delete_blob",
          blob_url: url,
          success: false,
          error_message: "Admin attempted deleting an actively linked Asset seamlessly.",
        });
        continue;
      }

      try {
        await storage.deleteBlob(url);
        successful.push(url);

        await logUploadAction({
          action: "delete_blob",
          blob_url: url,
          success: true,
        });
      } catch (e) {
        failed.push(`${url} (Vercel API Failure)`);
        await logUploadAction({
          action: "delete_blob",
          blob_url: url,
          success: false,
          error_message:
            e instanceof Error ? e.message : "Vercel SDK threw inside iterator natively",
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        summary: { successful, failed },
      },
      { status: 200 }
    );
  } catch (error) {
    const apiErr = handleApiError(error);
    return NextResponse.json(
      { success: false, error: apiErr.message },
      { status: apiErr.statusCode }
    );
  }
}
