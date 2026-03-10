import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getVideoById, updateVideoMetadata, deleteVideo } from "@/lib/queries/videos";
import { handleApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { storage } from "@/lib/blob";
import { z } from "zod";
import { upsertVideoSchema } from "@/lib/validations";

// Strict API Cache Webhook execution locally cleanly executing revalidate API without relying on HTTP Roundtrips natively
async function triggerInternalRevalidation(secret: string) {
   try {
     await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/revalidate`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ token: secret })
     });
   } catch {
      logger.warn("Admin Revalidation Webhook internal failure.");
   }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const video = await getVideoById(params.id);
    if (!video) return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 });
    return NextResponse.json({ success: true, data: video });
  } catch (error) {
    const apiErr = handleApiError(error);
    return NextResponse.json({ success: false, error: apiErr.message }, { status: apiErr.statusCode });
  } finally {
     logger.info("Admin GET Single Video", { id: params.id, durationMs: Date.now() - startTime });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    // Dynamically parsing optional keys guaranteeing partial validation bounds
    const partialSchema = upsertVideoSchema.partial();
    const body = await request.json();
    const validation = partialSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ success: false, error: "Validation failed" }, { status: 400 });
    }

    const updated = await updateVideoMetadata(params.id, validation.data);
    if (!updated) {
       return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 });
    }

    if (process.env.REVALIDATION_SECRET) {
       await triggerInternalRevalidation(process.env.REVALIDATION_SECRET);
    }

    return NextResponse.json({ success: true, data: updated });

  } catch (error) {
    const apiErr = handleApiError(error);
    return NextResponse.json({ success: false, error: apiErr.message }, { status: apiErr.statusCode });
  } finally {
     logger.info("Admin PATCH Video", { id: params.id, durationMs: Date.now() - startTime });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const video = await getVideoById(params.id);
    if (!video) return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 });

    // Ensure Vercel Blob deletion happens FIRST
    if (video.blob_url) {
      try {
        await storage.deleteBlob(video.blob_url);
      } catch (blobErr) {
        logger.error(`Blob orchestration delete failure safely ignored for ${video.blob_url}`, blobErr);
      }
    }

    if (video.thumbnail_url) {
      try {
        await storage.deleteBlob(video.thumbnail_url);
      } catch (thumbErr) {
        logger.error(`Thumbnail orchestration delete failure safely ignored for ${video.thumbnail_url}`, thumbErr);
      }
    }

    // Explicitly destroy Postgres keys natively bypassing Blob crashes fully cleanly guaranteeing DB alignments
    await deleteVideo(params.id);

    if (process.env.REVALIDATION_SECRET) {
      await triggerInternalRevalidation(process.env.REVALIDATION_SECRET);
    }

    return NextResponse.json({ success: true, deleted: true });

  } catch (error) {
    const apiErr = handleApiError(error);
    return NextResponse.json({ success: false, error: apiErr.message }, { status: apiErr.statusCode });
  } finally {
     logger.info("Admin DELETE Video", { id: params.id, durationMs: Date.now() - startTime });
  }
}
