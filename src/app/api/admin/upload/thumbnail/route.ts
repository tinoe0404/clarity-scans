import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { storage } from "@/lib/blob";
import { upsertVideo } from "@/lib/queries/videos";
import type { Locale, VideoSlug } from "@/types";
import { logUploadAction } from "@/lib/queries/uploadLog";
import { validateUploadRequest } from "@/lib/uploadValidation";
import { enforceRateLimit } from "@/lib/rateLimit";
import { handleApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  const session = await getAdminSession();
  if (!session || !session.user?.name) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const limitStatus = enforceRateLimit(`thumb_${session.user.name}`, 10, 60 * 60 * 1000);
  if (!limitStatus.success) {
    return NextResponse.json(
      { success: false, error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": limitStatus.retryAfterSeconds.toString() } }
    );
  }

  try {
    const formData = await request.formData();
    const validation = await validateUploadRequest(formData, "thumbnail");

    if (!validation.valid) {
      await logUploadAction({
        action: "upload_thumbnail",
        success: false,
        error_message: validation.error.message,
      });
      return NextResponse.json(
        { success: false, error: validation.error.message },
        { status: 400 }
      );
    }

    const { file, mimeType, slug } = validation.data;

    const uploadResult = await storage.uploadThumbnail({
      file,
      slug: slug as VideoSlug,
      contentType: mimeType as "image/jpeg" | "image/png" | "image/webp",
    });

    try {
      // Execute the Database trigger explicitly pushing thumbnail states
      // Assuming a generic Update function mapping thumbnail URL natively.
      // E.g 'upsertVideo' allows partial overrides or we could explicitly generate a thumbnail patch
      // Using upsertVideo natively against `thumbnail_url` across ALL localized variants natively

      const locales = ["en", "sn", "nd"] as const;
      await Promise.all(
        locales.map((loc) =>
          upsertVideo({
            slug,
            language: loc as Locale,
            title: "",
            blobUrl: "",
            thumbnailUrl: uploadResult.url,
            isActive: true,
          }).catch((_e) => {
            /* Ignore missing language variants natively */
          })
        )
      );

      if (process.env.REVALIDATION_SECRET) {
        try {
          await fetch(new URL("/api/revalidate", request.url).toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ secret: process.env.REVALIDATION_SECRET }),
          });
        } catch (_e) {}
      }

      await logUploadAction({
        action: "upload_thumbnail",
        slug,
        blob_url: uploadResult.url,
        file_size_bytes: uploadResult.size,
        success: true,
      });

      return NextResponse.json({ success: true, url: uploadResult.url }, { status: 201 });
    } catch (dbError) {
      // ⚠️ CLEANUP PATTERN EXPLANATION:
      // If the database fails to link the thumbnail, MUST delete it preventing Vercel Orphan bugs
      const errMsg = dbError instanceof Error ? dbError.message : "DB insertion failed";

      await storage.deleteBlob(uploadResult.url);

      await logUploadAction({
        action: "upload_thumbnail",
        slug,
        blob_url: uploadResult.url,
        success: false,
        error_message: `Post-Upload DB failure stripped clean: ${errMsg}`,
      });

      return NextResponse.json(
        { success: false, error: "Database mapping error triggering Purge cleanup" },
        { status: 500 }
      );
    }
  } catch (error) {
    const apiErr = handleApiError(error);
    await logUploadAction({
      action: "upload_thumbnail",
      success: false,
      error_message: apiErr.message,
    });
    return NextResponse.json(
      { success: false, error: apiErr.message },
      { status: apiErr.statusCode }
    );
  } finally {
    logger.info("Admin Thumbnail Upload", {
      method: "POST",
      path: request.nextUrl.pathname,
      durationMs: Date.now() - startTime,
    });
  }
}
