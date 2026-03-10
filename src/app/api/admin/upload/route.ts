import { NextResponse, type NextRequest } from "next/server";
import type { Locale } from "@/types";
import { getAdminSession } from "@/lib/auth";
import { storage } from "@/lib/blob";
import { upsertVideo } from "@/lib/queries/videos";
import { logUploadAction } from "@/lib/queries/uploadLog";
import { validateUploadRequest } from "@/lib/uploadValidation";
import { enforceRateLimit } from "@/lib/rateLimit";
import { handleApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";

// Vercel serverless configurations bypassing typical parsers
export const maxDuration = 60; // Max timeout available for Free Tier Serverless Upload proxying
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  const session = await getAdminSession();
  if (!session || !session.user?.name) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Strictly enforce a Rate Limit of 10 uploads per hour mapping against the explicit radiographer_id natively
  const limitStatus = enforceRateLimit(session.user.name, 10, 60 * 60 * 1000);
  if (!limitStatus.success) {
    logger.warn("Admin upload rate limit exceeded", { adminId: session.user.name });
    return NextResponse.json(
      { success: false, error: "Upload rate limit exceeded (10/hr)" },
      { status: 429, headers: { "Retry-After": limitStatus.retryAfterSeconds.toString() } }
    );
  }

  try {
    const formData = await request.formData();
    const validation = await validateUploadRequest(formData, "video");

    if (!validation.valid) {
      await logUploadAction({
        action: "upload_video",
        success: false,
        error_message: validation.error.message,
      });
      return NextResponse.json(
        { success: false, error: validation.error.message },
        { status: 400 }
      );
    }

    const { file, mimeType, slug, locale, title, description } = validation.data;

    // Explicit runtime check ensuring localized parameters aren't skipped
    if (!locale || !title) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: locale, title" },
        { status: 400 }
      );
    }

    // 1. Upload to Blob Storage
    // IMPORTANT: Strategy A (Server Upload) proxies the Buffer right to Vercel here.
    const uploadResult = await storage.uploadVideo({
      file,
      slug,
      locale: locale as Locale, // Typecast validated natively
      contentType: mimeType,
    });

    try {
      // 2. Database Insert (The Dual-Write critical section)
      const record = await upsertVideo({
        slug,
        language: locale as Locale,
        title,
        description: description || undefined,
        blobUrl: uploadResult.url,
      });

      // 3. Cache Revalidation Pipeline organically executing self triggers securely
      if (process.env.REVALIDATION_SECRET) {
        try {
          // Revalidate natively utilizing immediate parallel local networking bypassing external NAT loops
          await fetch(new URL("/api/revalidate", request.url).toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ secret: process.env.REVALIDATION_SECRET }),
          });
        } catch (_e) {
          /* Non-fatal, admin sees completion */
        }
      }

      // Success Logging
      await logUploadAction({
        action: "upload_video",
        slug,
        locale: locale as Locale,
        blob_url: uploadResult.url,
        file_size_bytes: uploadResult.size,
        success: true,
      });

      return NextResponse.json({ success: true, data: record }, { status: 201 });
    } catch (dbError) {
      // ⚠️ CLEANUP PATTERN EXPLANATION:
      // If the database insert throws (e.g., Neon connection bounds, constraint violation), the BLOB
      // already exists via the previous step. We MUST immediately delete the file to prevent creating
      // an orphaned "Ghost Blob" absorbing Free Tier caps without an active tracking ID!

      const errMsg = dbError instanceof Error ? dbError.message : "DB insertion failed";
      logger.error("Database tracking failed post-upload. Triggering Cleanup Purge", {
        slug,
        error: errMsg,
      });

      await storage.deleteBlob(uploadResult.url);

      await logUploadAction({
        action: "upload_video",
        slug,
        locale: locale as Locale,
        blob_url: uploadResult.url, // Tracks what 'could have been'
        success: false,
        error_message: `Post-Upload DB failure stripped clean: ${errMsg}`,
      });

      return NextResponse.json(
        { success: false, error: "Internal Database error during upload" },
        { status: 500 }
      );
    }
  } catch (error) {
    const apiErr = handleApiError(error);
    await logUploadAction({
      action: "upload_video",
      success: false,
      error_message: apiErr.message,
    });
    return NextResponse.json(
      { success: false, error: apiErr.message },
      { status: apiErr.statusCode }
    );
  } finally {
    logger.info("Admin Stream Upload Phase", {
      method: "POST",
      path: request.nextUrl.pathname,
      durationMs: Date.now() - startTime,
    });
  }
}
