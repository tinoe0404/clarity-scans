import { handleUpload } from "@vercel/blob/client";
import { NextResponse, type NextRequest } from "next/server";
import type { Locale } from "@/types";
import { upsertVideo } from "@/lib/queries/videos";
import { logUploadAction } from "@/lib/queries/uploadLog";
import { validateBlobWebhookPayload } from "@/lib/uploadValidation";
import { storage } from "@/lib/blob";
import { logger } from "@/lib/logger";

// Unprotected Route: Vercel Servers execute Webhook callbacks directly post-upload bypassing Admin cookies naturally
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();

    if (!validateBlobWebhookPayload(body)) {
      return NextResponse.json(
        { success: false, error: "Invalid generic layout" },
        { status: 400 }
      );
    }

    // handleUpload natively verifies internal Vercel webhook signatures stopping tampered inputs accurately
    const webhookResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({ tokenPayload: "{}" }),
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        if (!tokenPayload) {
          logger.error("Webhook triggered lacking tokenPayload bindings. Trashing blob natively.", {
            blobUrl: blob.url,
          });
          await storage.deleteBlob(blob.url);
          return;
        }

        const metadata = JSON.parse(tokenPayload) as {
          slug: string;
          locale: string;
          title: string;
          description?: string;
          radiographerId: string;
        };

        try {
          // Establish exact bindings executing dual-write guarantees purely
          await upsertVideo({
            slug: metadata.slug,
            language: metadata.locale as Locale,
            title: metadata.title,
            description: metadata.description,
            blobUrl: blob.url,
          });

          // Log the successful Phase 16 Client-side pipeline
          await logUploadAction({
            action: "upload_video",
            slug: metadata.slug,
            locale: metadata.locale as Locale,
            blob_url: blob.url,
            file_size_bytes: blob.size,
            success: true,
          });

          // Revalidation runs automatically pushing changes directly outwards seamlessly
          if (process.env.REVALIDATION_SECRET) {
            try {
              await fetch(new URL("/api/revalidate", request.url).toString(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ secret: process.env.REVALIDATION_SECRET }),
              });
            } catch (_e) {
              /* Async */
            }
          }
        } catch (dbError) {
          const errMsg = dbError instanceof Error ? dbError.message : "Webhook DB insert failure";
          logger.error(
            "Database constraint failed during Client-Side Webhook completion. Triggering Purge.",
            { slug: metadata.slug, error: errMsg }
          );

          // Cleanup Pattern identically ensuring Ghost files are nuked smoothly
          await storage.deleteBlob(blob.url);

          await logUploadAction({
            action: "upload_video",
            slug: metadata.slug,
            locale: metadata.locale as Locale,
            blob_url: blob.url,
            success: false,
            error_message: `Webhook Purge active: ${errMsg}`,
          });
        }
      },
    });

    return NextResponse.json(webhookResponse, { status: 200 });
  } catch (error) {
    logger.error("Vercel Webhook completion sequence failed", error);
    return NextResponse.json({ success: false, error: "Webhook failure" }, { status: 500 });
  } finally {
    logger.info("Admin Webhook Execution", {
      method: "POST",
      path: request.nextUrl.pathname,
      durationMs: Date.now() - startTime,
    });
  }
}
