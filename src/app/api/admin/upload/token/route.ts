import { handleUpload } from "@vercel/blob/client";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rateLimit";

import { MAX_VIDEO_SIZE_BYTES, ACCEPTED_VIDEO_TYPES } from "@/lib/constants";
import { logger } from "@/lib/logger";

// Generate tokens for Direct-Browser-to-Vercel uploads (Strategy B) securely bounding payloads
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  const session = await getAdminSession();
  if (!session || !session.user?.name) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Token endpoints hit the exact same Rate Counter natively
  const limitStatus = enforceRateLimit(session.user.name, 10, 60 * 60 * 1000);
  if (!limitStatus.success) {
    return NextResponse.json(
      { success: false, error: "Upload rate limit exceeded (10/hr)" },
      { status: 429, headers: { "Retry-After": limitStatus.retryAfterSeconds.toString() } }
    );
  }

  try {
    const body = (await request.json()) as {
      filename: string;
      contentType: string;
      slug: string;
      locale: string;
      title: string;
      description?: string;
    };

    if (!body.filename || !body.slug || !body.locale || !body.title) {
      return NextResponse.json(
        { success: false, error: "Missing required metadata" },
        { status: 400 }
      );
    }

    if (!ACCEPTED_VIDEO_TYPES.includes(body.contentType)) {
      return NextResponse.json({ success: false, error: "Invalid video format" }, { status: 400 });
    }

    // `@vercel/blob/client` handles signing the Token preventing explicit modification on the frontend natively
    const clientTokenResult = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ACCEPTED_VIDEO_TYPES,
          maximumSizeInBytes: MAX_VIDEO_SIZE_BYTES,
          // Attaching Custom Metadata securely embeds the tracking strings into the Vercel Blob webhook reliably
          tokenPayload: JSON.stringify({
            slug: body.slug,
            locale: body.locale,
            title: body.title,
            description: body.description,
            radiographerId: session.user?.name,
          }),
        };
      },
      onUploadCompleted: async () => {
        /* Webhook receiver handles DB */
      },
    });

    return NextResponse.json({ success: true, data: clientTokenResult }, { status: 200 });
  } catch (error) {
    logger.error("Failed generating Vercel Token", error);
    return NextResponse.json(
      { success: false, error: "Failed generating upload token" },
      { status: 500 }
    );
  } finally {
    logger.info("Admin generated Vercel Direct Upload Token", {
      method: "POST",
      path: request.nextUrl.pathname,
      durationMs: Date.now() - startTime,
    });
  }
}
