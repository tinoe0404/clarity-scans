import { NextResponse } from "next/server";
import { localeSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = localeSchema.safeParse(body.locale);

    if (!result.success) {
      return NextResponse.json({ success: false, error: "Invalid locale" }, { status: 400 });
    }

    const locale = result.data;
    const response = NextResponse.json({ success: true });

    // Ensure we explicitly set the cookie for standard next-intl usage.
    // 1 year max age so subsequent visits retain language hint.
    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to set locale" }, { status: 500 });
  }
}
