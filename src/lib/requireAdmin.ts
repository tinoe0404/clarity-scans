import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

/**
 * Server-side function to enforce admin authentication in Server Components and Actions.
 * Redirects to /admin/login if the user is not authenticated as an admin.
 *
 * IMPORTANT: All admin API routes created in future phases must use requireAdminApi().
 */
export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  return session;
}

/**
 * API route handler guard to enforce admin authentication.
 * Returns a 401 Unauthorized response if the user is not authenticated as an admin.
 */
export async function requireAdminApi() {
  const session = await getAdminSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  return session;
}
