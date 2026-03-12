import { getAdminSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import DashboardOverview from "@/components/admin/DashboardOverview";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard — ClarityScans Admin",
};

export const revalidate = 60; // Auto-regenerate HTML natively every 60s natively mapping real-time streams safely

async function getAnalyticsData() {
  const host = headers().get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  
  try {
    const res = await fetch(`${protocol}://${host}/api/admin/analytics?dateRange=week`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      return null; // Return null instead of throwing avoiding Error Boundaries natively
    }
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.error("Dashboard Server Fetch Failed:", err);
    return null; // Return null rather than throwing so client can render empty/error states securely
  }
}

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  
  const analyticsData = await getAnalyticsData();

  return (
    <AdminShell>
      <DashboardOverview initialData={analyticsData} />
    </AdminShell>
  );
}
