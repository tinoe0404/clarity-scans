import { NextResponse, type NextRequest } from "next/server";
import type { Locale } from "@/types";
import { upsertVideo } from "@/lib/queries/videos";
import { logUploadAction } from "@/lib/queries/uploadLog";
import { storage } from "@/lib/blob";
import { getR2PublicUrl } from "@/lib/r2";
import { logger } from "@/lib/logger";

/**
 * POST /api/admin/upload/complete
 *
 * Called by the client AFTER a successful presigned upload to R2.
 * This endpoint creates the database record linking the uploaded file.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = (await request.json()) as {
      key: string;
      slug: string;
      locale: string;
      title: string;
      description?: string;
      fileSize?: number;
    };

    if (!body.key || !body.slug || !body.locale || !body.title) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const publicUrl = getR2PublicUrl(body.key);

    try {
      // Create/update the database record linking the R2 object
      const record = await upsertVideo({
        slug: body.slug,
        language: body.locale as Locale,
        title: body.title,
        description: body.description,
        blobUrl: publicUrl,
        isActive: true,
      });

      // Log success
      await logUploadAction({
        action: "upload_video",
        slug: body.slug,
        locale: body.locale as Locale,
        blob_url: publicUrl,
        file_size_bytes: body.fileSize ?? 0,
        success: true,
      });

      // Revalidation
      if (process.env.REVALIDATION_SECRET) {
        try {
          await fetch(new URL("/api/revalidate", request.url).toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: process.env.REVALIDATION_SECRET }),
          });
        } catch (_e) {
          /* Non-fatal */
        }
      }

      return NextResponse.json({ success: true, data: record }, { status: 200 });
    } catch (dbError) {
      // If DB insert fails, clean up the R2 object to prevent orphans
      const errMsg = dbError instanceof Error ? dbError.message : "DB insertion failed";
      logger.error("Database tracking failed post-R2-upload. Triggering cleanup.", {
        key: body.key,
        error: errMsg,
      });

      await storage.deleteBlob(publicUrl);

      await logUploadAction({
        action: "upload_video",
        slug: body.slug,
        locale: body.locale as Locale,
        blob_url: publicUrl,
        success: false,
        error_message: `Post-Upload DB failure, R2 object cleaned: ${errMsg}`,
      });

      return NextResponse.json(
        { success: false, error: "Database error during upload completion" },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error("Upload completion failed", error);
    return NextResponse.json({ success: false, error: "Completion failed" }, { status: 500 });
  } finally {
    logger.info("Admin Upload Completion", {
      method: "POST",
      path: request.nextUrl.pathname,
      durationMs: Date.now() - startTime,
    });
  }
}
