import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const rawBody = await request.text();
    let body;
    
    try {
       body = JSON.parse(rawBody);
    } catch {
       return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const { token } = body;
    const secret = process.env.REVALIDATION_SECRET;

    if (!secret) {
      logger.error("REVALIDATION_SECRET is not configured on the server.");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!token || token !== secret) {
      logger.warn("Invalid revalidation token attempt", { 
         path: request.nextUrl.pathname,
         ip: request.headers.get("x-forwarded-for") || "unknown" 
      });
      return NextResponse.json(
        { success: false, error: "Unauthorized revalidation request" },
        { status: 401 }
      );
    }

    // 1. Purge Public API JSON Caches explicitly
    revalidatePath("/api/videos");
    revalidatePath("/api/videos/[slug]", "page"); 

    // 2. Purge Static Next.js Patient Layouts specifically
    revalidatePath("/[locale]/modules", "page");

    return NextResponse.json({ 
       success: true, 
       revalidated: true, 
       timestamp: Date.now() 
    });

  } catch (error) {
    logger.error("Revalidation Error", error);
    return NextResponse.json(
      { success: false, error: "Failed to revalidate caches" },
      { status: 500 }
    );
  } finally {
     logger.info("Admin Cache Purge", { durationMs: Date.now() - startTime });
  }
}
