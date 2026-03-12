import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getSessionById } from "@/lib/queries/sessions";
import { handleApiError } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const sessionRecord = await getSessionById(id);

    if (!sessionRecord) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    }

    // Only return safe non-identifying metadata
    const data = {
      language: sessionRecord.language,
      started_at: sessionRecord.started_at,
      completed_modules_count: sessionRecord.completed_modules.length,
      device_type: sessionRecord.device_type,
    };

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    const apiErr = handleApiError(error);
    return NextResponse.json(
      { success: false, error: apiErr.message },
      { status: apiErr.statusCode }
    );
  }
}
