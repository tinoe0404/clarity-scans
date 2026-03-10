import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { updateVideoActiveStatus } from "@/lib/queries/videos";
import { handleApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { z } from "zod";

const toggleSchema = z.object({
  isActive: z.boolean()
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = toggleSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ success: false, error: "Invalid boolean payload" }, { status: 400 });
    }

    await updateVideoActiveStatus(params.id, validation.data.isActive);

    // Auto-flush downstream
    if (process.env.REVALIDATION_SECRET) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/revalidate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: process.env.REVALIDATION_SECRET })
        });
      } catch (e) {
         logger.warn("Toggle Webhook Trigger failure");
      }
    }

    return NextResponse.json({ success: true, isActive: validation.data.isActive });

  } catch (error) {
    const apiErr = handleApiError(error);
    return NextResponse.json({ success: false, error: apiErr.message }, { status: apiErr.statusCode });
  } finally {
     logger.info("Admin Toggled Video Status", { id: params.id, durationMs: Date.now() - startTime });
  }
}
