import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AnalyticsScreen from "@/components/admin/AnalyticsScreen";
import { headers } from "next/headers";
import type { FeedbackSummary } from "@/lib/queries/feedback";

export const metadata = {
  title: "Feedback Analytics — ClarityScans Admin",
};

export const revalidate = 300;

async function getSummary(): Promise<FeedbackSummary | null> {
  const host = headers().get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  try {
    const res = await fetch(
      `${protocol}://${host}/api/feedback/summary?dateRange=month`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export default async function AdminAnalyticsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const summary = await getSummary();

  return (
    <AdminShell>
      <AnalyticsScreen initialSummary={summary} />
    </AdminShell>
  );
}
