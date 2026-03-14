import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAllVideos, upsertVideo } from "@/lib/queries/videos";
import { handleApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { upsertVideoSchema } from "@/lib/validations";
import { storage } from "@/lib/blob";
import type { VideoRecord, VideoSlug } from "@/types";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  // 1. MUST PROTECT ROUTE IMMEDIATELY
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const includeStats = searchParams.get("includeStats") === "true";
    
    // Admin route inherently requests everything bypassing active gates strictly 
    const videos = await getAllVideos();

    // Group heavily optimizing Phase 18 Matrix lists natively
    const grouped = videos.reduce((acc, video) => {
      if (!acc[video.slug]) {
        acc[video.slug] = [];
      }
      const list = acc[video.slug];
      if (list) {
        list.push(video);
      }
      return acc;
    }, {} as Record<VideoSlug | string, VideoRecord[]>);

    let stats = null;
    if (includeStats) {
       stats = await storage.getStorageStats();
    }

    return NextResponse.json({ 
       success: true, 
       data: { grouped, stats } 
    }, { status: 200 });

  } catch (error) {
    const apiErr = handleApiError(error);
    return NextResponse.json(
      { success: false, error: apiErr.message }, 
      { status: apiErr.statusCode }
    );
  } finally {
    logger.info("Fetched Admin Video List", { durationMs: Date.now() - startTime });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = upsertVideoSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
         success: false, 
         error: "Validation failed", 
         details: validation.error.format() 
      }, { status: 400 });
    }

    const created = await upsertVideo(validation.data);

    return NextResponse.json({ success: true, data: created }, { status: 201 });

  } catch (error) {
    const apiErr = handleApiError(error);
    return NextResponse.json(
      { success: false, error: apiErr.message }, 
      { status: apiErr.statusCode }
    );
  } finally {
     logger.info("Admin Upserted Video", { durationMs: Date.now() - startTime });
  }
}
