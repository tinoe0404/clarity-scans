import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import VideoManagerScreen from "@/components/admin/VideoManagerScreen";
import { headers } from "next/headers";
import type { VideoRecord, StorageStats } from "@/types";

export const metadata = {
  title: "Video Manager — ClarityScans Admin",
};

export const revalidate = 60;

interface VideosApiResponse {
  success: boolean;
  data: {
    grouped: Record<string, VideoRecord[]>;
    stats: StorageStats | null;
  };
}

async function getVideoData(): Promise<{
  grouped: Record<string, VideoRecord[]>;
  stats: StorageStats | null;
}> {
  const host = headers().get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  try {
    const res = await fetch(`${protocol}://${host}/api/admin/videos?includeStats=true`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { grouped: {}, stats: null };
    const json: VideosApiResponse = await res.json();
    return json.success ? json.data : { grouped: {}, stats: null };
  } catch (err) {
    console.error("Video Manager Server Fetch Failed:", err);
    return { grouped: {}, stats: null };
  }
}

export default async function AdminVideosPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const { grouped, stats } = await getVideoData();

  return <VideoManagerScreen initialGrouped={grouped} initialStats={stats} />;
}
