import { NextResponse } from "next/server";
import { z } from "zod";
import { updateSessionModules } from "@/lib/queries/sessions";
import type { VideoSlug } from "@/lib/moduleRegistry";

// Module explicit boundary tuple
const moduleUpdateSchema = z.object({
  completedModules: z.array(z.string().min(1)).max(10), // Bounds preventing infinite array DOS attacks inherently
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    
    // UUID basic format evaluation
    const uuidSchema = z.string().uuid();
    const idValidation = uuidSchema.safeParse(sessionId);
    if (!idValidation.success) {
      return NextResponse.json({ error: "Invalid session format" }, { status: 400 });
    }

    const body = await request.json();
    const validation = moduleUpdateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    // Explicit Type coercing guaranteeing strict registry tuple limits natively 
    const modulesToUpdate = validation.data.completedModules as VideoSlug[];
    
    const result = await updateSessionModules(sessionId, modulesToUpdate);
    
    if (!result) {
       return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error) {
    console.error("Sessions PATCH Error:", error);
    return NextResponse.json(
      { error: "Failed to update session modules" },
      { status: 500 }
    );
  }
}
