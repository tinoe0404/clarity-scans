import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/queries/sessions";
import { localeSchema } from "@/lib/validations";

// Strict bootstrapping requirements tuple
const createSessionRouteSchema = z.object({
  language: localeSchema,
  deviceType: z.string().max(100).optional(),
});

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      // Allow the app to boot gracefully on dev environments missing heavy PG deployments natively
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    const validation = createSessionRouteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid session parameters" },
        { status: 400 }
      );
    }

    const session = await createSession(
      validation.data.language, 
      validation.data.deviceType || "unknown"
    );

    return NextResponse.json({ id: session.id }, { status: 201 });
    
  } catch (error) {
    console.error("Sessions POST Error:", error);
    return NextResponse.json(
      { error: "Internal server error creating session" },
      { status: 500 }
    );
  }
}
