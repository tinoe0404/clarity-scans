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
    const { getAllVideos } = await import("@/lib/queries/videos");
    const { storage } = await import("@/lib/blob");

    const videos = await getAllVideos();

    const grouped = videos.reduce((acc, video) => {
      if (!acc[video.slug]) acc[video.slug] = [];
      acc[video.slug].push(video);
      return acc;
    }, {} as Record<string, VideoRecord[]>);

    const stats = await storage.getStorageStats();

    return { grouped, stats };
  } catch (err) {
    console.error("Video Manager DB Fetch Failed:", err);
    return { grouped: {}, stats: null };
  }
}

export default async function AdminVideosPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const { grouped, stats } = await getVideoData();

  return <VideoManagerScreen initialGrouped={grouped} initialStats={stats} />;
}
