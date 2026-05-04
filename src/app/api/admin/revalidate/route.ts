import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { logger } from "@/lib/logger";

const SUPPORTED_LOCALES = ["en", "sn", "nd"];
const VIDEO_SLUGS = ["what-is-ct", "prepare", "breathhold", "contrast", "staying-still"];

/**
 * Admin-authenticated endpoint to purge public-facing caches.
 * Called by the client after uploads/deletes/edits to ensure
 * public pages reflect the latest data.
 */
export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    revalidatePath("/api/videos");
    revalidatePath("/api/videos/[slug]", "page");
    revalidatePath("/[locale]/modules", "page");
    for (const loc of SUPPORTED_LOCALES) {
      for (const slug of VIDEO_SLUGS) {
        revalidatePath(`/${loc}/watch/${slug}`, "page");
      }
    }
    SUPPORTED_LOCALES.forEach(loc => revalidateTag(`videos-${loc}`));

    logger.info("Admin-triggered cache purge completed");
    return NextResponse.json({ success: true, revalidated: true });
  } catch (error) {
    logger.error("Admin revalidation failed", error);
    return NextResponse.json({ success: false, error: "Revalidation failed" }, { status: 500 });
  }
}
