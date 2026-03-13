import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rateLimit";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client, R2_BUCKET_NAME } from "@/lib/r2";
import { BlobPaths } from "@/lib/blob";
import { MAX_VIDEO_SIZE_BYTES, ACCEPTED_VIDEO_TYPES } from "@/lib/constants";
import { logger } from "@/lib/logger";
import type { Locale, VideoSlug } from "@/types";

// Generate presigned URLs for direct-to-R2 uploads from the browser
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  const session = await getAdminSession();
  if (!session || !session.user?.name) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

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

    if (!(ACCEPTED_VIDEO_TYPES as readonly string[]).includes(body.contentType)) {
      return NextResponse.json({ success: false, error: "Invalid video format" }, { status: 400 });
    }

    const key = BlobPaths.video(body.locale as Locale, body.slug as VideoSlug);
    const client = getR2Client();

    // Generate a presigned URL that allows the client to upload directly to R2
    const presignedUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: body.contentType,
      }),
      { expiresIn: 3600 } // 1 hour expiry
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          presignedUrl,
          key,
          maxSize: MAX_VIDEO_SIZE_BYTES,
          metadata: {
            slug: body.slug,
            locale: body.locale,
            title: body.title,
            description: body.description,
            radiographerId: session.user?.name,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed generating R2 presigned URL", error);
    return NextResponse.json(
      { success: false, error: "Failed generating upload token" },
      { status: 500 }
    );
  } finally {
    logger.info("Admin generated R2 presigned upload URL", {
      method: "POST",
      path: request.nextUrl.pathname,
      durationMs: Date.now() - startTime,
    });
  }
}
