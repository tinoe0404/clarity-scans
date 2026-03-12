import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { deleteNote } from "@/lib/queries/radiographerNotes";
import { handleApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const session = await getAdminSession();
  
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    await deleteNote(id);
    
    // Revalidate paths affected by notes deletion
    revalidatePath("/api/sessions/summary");
    revalidatePath("/api/admin/analytics");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const apiErr = handleApiError(error);
    return NextResponse.json(
      { success: false, error: apiErr.message },
      { status: apiErr.statusCode }
    );
  } finally {
    logger.info("Admin Deleted Clinical Note", {
      method: "DELETE",
      path: request.nextUrl.pathname,
      durationMs: Date.now() - startTime,
    });
  }
}
