import { NextResponse, type NextRequest } from "next/server";
import { getVideosByLanguage } from "@/lib/queries/videos";
import { localeSchema } from "@/lib/validations";
import { handleApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";

// Maximum Cache Revalidation (60 mins) completely circumventing heavy DB loads mapping to Slow Hospital WiFis seamlessly
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const path = request.nextUrl.pathname;
  let localeParam = "none";

  try {
    const searchParams = request.nextUrl.searchParams;
    const localeRaw = searchParams.get("locale");
    
    if (!localeRaw) {
      return NextResponse.json(
        { success: false, error: "Missing locale parameter" }, 
        { status: 400 }
      );
    }

    const validation = localeSchema.safeParse(localeRaw);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid locale format" }, 
        { status: 400 }
      );
    }

    const locale = validation.data;
    localeParam = locale;

    if (!process.env.DATABASE_URL) {
       // Graceful missing DB fallbacks serving Empty bounds returning valid 200 [] arrays natively protecting layouts
       return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    const rawVideos = await getVideosByLanguage(locale);

    // Stripped Output Pipeline strictly checking active boolean guards natively preventing blob leakage
    const sanitizedData = rawVideos
      .filter(v => v.is_active) 
      .map(v => ({
         id: v.id,
         slug: v.slug,
         language: v.language,
         title: v.title,
         description: v.description,
         blob_url: v.blob_url,
         thumbnail_url: v.thumbnail_url,
         duration_seconds: v.duration_seconds,
         sort_order: v.sort_order,
         is_active: true,
         created_at: v.created_at,
      }));

    return NextResponse.json({ success: true, data: sanitizedData }, { status: 200 });

  } catch (error) {
    const apiErr = handleApiError(error);
    return NextResponse.json(
      { success: false, error: apiErr.message }, 
      { status: apiErr.statusCode }
    );
  } finally {
    logger.info("Fetched Public Video Catalog", { 
      method: 'GET',
      path, 
      locale: localeParam,
      durationMs: Date.now() - startTime 
    });
  }
}
