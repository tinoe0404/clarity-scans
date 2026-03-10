import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getFeedbackSummary } from "@/lib/queries/feedback";
import { handleApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const revalidate = 300; // 5 min admin cache

const dateRangeSchema = z.enum(["week", "month", "all"]).default("week");

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const dateRangeRaw = searchParams.get("dateRange") || "week";

    const validation = dateRangeSchema.safeParse(dateRangeRaw);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: "Invalid date range" }, { status: 400 });
    }

    const summary = await getFeedbackSummary(validation.data);

    return NextResponse.json({ success: true, data: summary }, { status: 200 });
  } catch (error) {
    const apiErr = handleApiError(error);
    return NextResponse.json(
      { success: false, error: apiErr.message },
      { status: apiErr.statusCode }
    );
  } finally {
    logger.info("Admin GET Feedback Summary", {
      method: "GET",
      path: request.nextUrl.pathname,
      durationMs: Date.now() - startTime,
    });
  }
}
