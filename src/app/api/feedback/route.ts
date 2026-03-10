import { NextResponse } from "next/server";
import { createFeedbackSchema } from "@/lib/validations";
import { createFeedback } from "@/lib/queries/feedback";
import { getSessionById } from "@/lib/queries/sessions";

export async function POST(request: Request) {
  try {
    // 1. Verify system readiness preventing unhandled Prisma configuration crashes
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database configuration missing. Feedback cannot be saved." },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    // 2. Validate exact structured payload cleanly via Zod bounds natively
    const validation = createFeedbackSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 3. Security: Prevent orphaned records or naive DOS abuse strictly mapping against existing DB states
    const existingSession = await getSessionById(data.sessionId);
    if (!existingSession) {
       return NextResponse.json(
         { error: "Invalid session. Feedback cannot be saved to an unknown session." },
         { status: 400 }
       );
    }

    // 4. Strict DB commit isolating away actual SQL structures naturally
    const result = await createFeedback(data);

    // 5. Patient privacy: never leak internal schema tuple IDs or patient configurations backward linearly
    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
    
  } catch (error) {
    console.error("Feedback POST Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error failed to create feedback" },
      { status: 500 }
    );
  }
}
