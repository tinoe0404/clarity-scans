import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  updateSessionModules,
  getSessionById,
  touchSession,
  updateSessionDeviceType,
} from "@/lib/queries/sessions";
import { handleApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";

// Module explicit boundary tuple mapping exactly against Registry boundaries natively
const moduleUpdateSchema = z.object({
  completedModules: z
    .array(z.enum(["what-is-ct", "prepare", "breathhold", "contrast", "staying-still"]))
    .max(5),
  deviceType: z.enum(["tablet", "phone", "unknown"]).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now();
  const sessionId = params.id;

  try {
    // 1. Strict UUID injection protection
    const idValidation = z.string().uuid().safeParse(sessionId);
    if (!idValidation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid session UUID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = moduleUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payload format" },
        { status: 400 }
      );
    }

    // 2. Existence check ensuring we don't blind-update ghost arrays natively
    const existingSession = await getSessionById(sessionId);
    if (!existingSession) {
      return NextResponse.json(
        { success: false, error: "Session not found", resource: "Session" },
        { status: 404 }
      );
    }

    // 3. Database operations mapped into precise dual-write locks seamlessly
    const updates: Promise<void>[] = [];

    if (validation.data.completedModules) {
      updates.push(updateSessionModules(sessionId, validation.data.completedModules));
      updates.push(touchSession(sessionId)); // Always touch alongside completions natively
    }

    if (validation.data.deviceType && validation.data.deviceType !== existingSession.device_type) {
      updates.push(updateSessionDeviceType(sessionId, validation.data.deviceType));
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const apiErr = handleApiError(error);
    return NextResponse.json(
      { success: false, error: apiErr.message },
      { status: apiErr.statusCode }
    );
  } finally {
    logger.info("PATCH Session Synced", {
      method: "PATCH",
      path: request.nextUrl.pathname,
      durationMs: Date.now() - startTime,
    });
  }
}
