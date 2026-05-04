import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getVideoById, updateVideoMetadata, deleteVideo } from "@/lib/queries/videos";
import { handleApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { storage } from "@/lib/blob";
import { upsertVideoSchema } from "@/lib/validations";
import { revalidatePath, revalidateTag } from "next/cache";

const SUPPORTED_LOCALES = ["en", "sn", "nd"];
const VIDEO_SLUGS = ["what-is-ct", "prepare", "breathhold", "contrast", "staying-still"];

/** Directly purge Next.js caches without HTTP loopback */
function purgePublicCaches() {
  revalidatePath("/api/videos");
  revalidatePath("/api/videos/[slug]", "page");
  revalidatePath("/[locale]/modules", "page");
  for (const loc of SUPPORTED_LOCALES) {
    for (const slug of VIDEO_SLUGS) {
      revalidatePath(`/${loc}/watch/${slug}`, "page");
    }
  }
  SUPPORTED_LOCALES.forEach(loc => revalidateTag(`videos-${loc}`));
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
    const data = validation.data;
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    ) as Parameters<typeof updateVideoMetadata>[1];

    const updated = await updateVideoMetadata(params.id, cleanData);
    if (!updated) {
       return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 });
    }

    purgePublicCaches();

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

    // Delete from Postgres
    await deleteVideo(params.id);

    // Directly purge all public-facing caches
    purgePublicCaches();

    return NextResponse.json({ success: true, deleted: true });

  } catch (error) {
    const apiErr = handleApiError(error);
    return NextResponse.json({ success: false, error: apiErr.message }, { status: apiErr.statusCode });
  } finally {
     logger.info("Admin DELETE Video", { id: params.id, durationMs: Date.now() - startTime });
  }
}
