import { NextResponse, type NextRequest } from "next/server";
import { createSession } from "@/lib/queries/sessions";
import { localeSchema } from "@/lib/validations";
import { handleApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";

import { enforceRateLimit } from "@/lib/rateLimit";

const BLOCK_THRESHOLD = 50;
const BLOCK_EXPIRY_MS = 60 * 60 * 1000; // 1 hr

function parseDeviceType(userAgent: string | null): "tablet" | "phone" | "unknown" {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();

  // iPads and explicit tablets
  if (
    ua.includes("ipad") ||
    (ua.includes("android") && !ua.includes("mobile")) ||
    ua.includes("tablet")
  ) {
    return "tablet";
  }
  // Phones
  if (ua.includes("mobile") || ua.includes("iphone") || ua.includes("android")) {
    return "phone";
  }
  return "unknown";
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // 1. Abuse Prevention natively isolating IPs
  const clientIp = request.headers.get("x-forwarded-for") || "unknown_ip";
  const limitStatus = enforceRateLimit(clientIp, BLOCK_THRESHOLD, BLOCK_EXPIRY_MS);

  if (!limitStatus.success) {
    logger.warn(`Rate limit triggered blocking Session creation burst`, { ip: clientIp });
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": limitStatus.retryAfterSeconds.toString() },
      }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));

    if (!body.language) {
      return NextResponse.json({ success: false, error: "Missing language" }, { status: 400 });
    }

    const validation = localeSchema.safeParse(body.language);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: "Invalid locale format" }, { status: 400 });
    }

    // Explicitly parse useragent falling back if the client payload wasn't provided natively
    const deviceType = body.deviceType || parseDeviceType(request.headers.get("user-agent"));

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    // Create mapping explicitly generating a uuid returning identically
    const session = await createSession(validation.data, deviceType);

    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (error) {
    const apiErr = handleApiError(error);
    return NextResponse.json(
      { success: false, error: apiErr.message },
      { status: apiErr.statusCode }
    );
  } finally {
    logger.info("Created Session", {
      method: "POST",
      path: request.nextUrl.pathname,
      durationMs: Date.now() - startTime,
    });
  }
}
