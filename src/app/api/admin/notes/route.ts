import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createNote, getAllNotes, getNotesSummary, getCalendarHeatmap } from "@/lib/queries/radiographerNotes";
import { createNoteSchema } from "@/lib/validations";
import { handleApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = createNoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: "Validation failed" }, { status: 400 });
    }

    // Force inject the authenticated user exactly ensuring Admin footprints properly log natively
    const payload = { ...validation.data, radiographerId: session.user?.name || "admin" };

    const note = await createNote(payload);

    // Flush Admin Session Summary routes since Repeat Scans mutate the dashboard natively
    revalidatePath("/api/sessions/summary");
    revalidatePath("/api/admin/analytics");

    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error) {
    const apiErr = handleApiError(error);
    return NextResponse.json(
      { success: false, error: apiErr.message },
      { status: apiErr.statusCode }
    );
  } finally {
    logger.info("Admin Created Clinical Note", {
      method: "POST",
      path: request.nextUrl.pathname,
      durationMs: Date.now() - startTime,
    });
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format");
    const pageRaw = searchParams.get("page") || "1";
    const pageSizeRaw = searchParams.get("pageSize") || "50";

    const page = parseInt(pageRaw, 10);
    const pageSize = parseInt(pageSizeRaw, 10);

    const summary = searchParams.get("summary");
    const dateRange = searchParams.get("dateRange") as "week" | "month" | "all" || "all";

    if (format === "calendar") {
      const data = await getCalendarHeatmap();
      return NextResponse.json({ success: true, data }, { status: 200 });
    }

    const { rows, total } = await getAllNotes(page, pageSize);

    if (format === "csv") {
      // Clean CSV Array stripping Session IDs out permanently natively
      const headers = [
        "id",
        "followed_breathhold",
        "repeat_scan_required",
        "language_used",
        "comments",
        "radiographer_id",
        "created_at",
      ];

      const csvRows = rows.map((row) => {
        return [
          row.id,
          row.followed_breathhold,
          row.repeat_scan_required,
          row.language_used,
          `"${(row.comments || "").replace(/"/g, '""')}"`,
          (row as any).radiographer_id || (row as any).radiographerId || "unknown",
          new Date(row.created_at || (row as any).createdAt || new Date()).toISOString(),
        ].join(",");
      });

      const csvContent = [headers.join(","), ...csvRows].join("\n");

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="notes-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    if (summary === "true") {
      const summaryData = await getNotesSummary(dateRange);
      return NextResponse.json(
        {
          success: true,
          data: rows,
          summary: summaryData,
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: rows,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const apiErr = handleApiError(error);
    return NextResponse.json(
      { success: false, error: apiErr.message },
      { status: apiErr.statusCode }
    );
  } finally {
    logger.info("Admin GET Notes List", {
      method: "GET",
      path: request.nextUrl.pathname,
      durationMs: Date.now() - startTime,
    });
  }
}
