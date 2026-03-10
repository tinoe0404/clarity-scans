import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";

// Warning: Not exported globally. This remains inside current Edge memory context.
// Map expires natively across Cold Starts (this is a best-effort tracker safely isolating states securely)
export const progressStore = new Map<
  string,
  {
    progress: number;
    status: "uploading" | "processing" | "complete" | "error";
    lastUpdated: number;
  }
>();

export async function GET(request: NextRequest, { params }: { params: { uploadId: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { uploadId } = params;

  // Perform organic memory leak cleanup targeting items > 10 minutes seamlessly
  const now = Date.now();
  for (const [key, val] of progressStore.entries()) {
    if (now - val.lastUpdated > 10 * 60 * 1000) {
      progressStore.delete(key);
    }
  }

  const record = progressStore.get(uploadId);

  if (!record) {
    return NextResponse.json(
      {
        success: true,
        data: { progress: 0, status: "processing" }, // Safely fall back without failing Native UIs
      },
      { status: 200 }
    );
  }

  return NextResponse.json({ success: true, data: record }, { status: 200 });
}
