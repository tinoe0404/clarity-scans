import { NextResponse, type NextRequest } from "next/server";
import { getVideoBySlug } from "@/lib/queries/videos";
import { localeSchema } from "@/lib/validations";
import { handleApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const revalidate = 3600;

const slugSchema = z.enum(["what-is-ct", "prepare", "breathhold", "contrast", "staying-still"]);

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const startTime = Date.now();
  const path = request.nextUrl.pathname;
  let reqLocale = "unknown";

  try {
    const slugValidation = slugSchema.safeParse(params.slug);
    if (!slugValidation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid video slug" }, 
        { status: 400 }
      );
    }
    const slug = slugValidation.data;

    const searchParams = request.nextUrl.searchParams;
    const localeRaw = searchParams.get("locale");
    
    if (!localeRaw) {
      return NextResponse.json(
         { success: false, error: "Missing locale parameter" }, 
         { status: 400 }
      );
    }

    const localeValidation = localeSchema.safeParse(localeRaw);
    if (!localeValidation.success) {
      return NextResponse.json(
         { success: false, error: "Invalid locale format" }, 
         { status: 400 }
      );
    }
    reqLocale = localeValidation.data;

    if (!process.env.DATABASE_URL) {
      // 503 Fallback natively dropping placeholder tokens instructing Client Players safely mapping DB configurations downstream
      return NextResponse.json(
         { success: false, error: "Database offline", fallbackToPlaceholder: true }, 
         { status: 503 }
      );
    }

    const video = await getVideoBySlug(slug, localeValidation.data);

    if (!video || !video.is_active) {
       return NextResponse.json(
          { success: false, error: "Video not found or inactive" },
          { status: 404 }
       );
    }

    return NextResponse.json({ success: true, data: video }, { status: 200 });

  } catch (error) {
    const apiErr = handleApiError(error);
    return NextResponse.json(
      { success: false, error: apiErr.message }, 
      { status: apiErr.statusCode }
    );
  } finally {
    logger.info("Fetched Single Public Video", { 
       method: 'GET',
       path,
       slug: params.slug,
       locale: reqLocale,
       durationMs: Date.now() - startTime 
    });
  }
}
