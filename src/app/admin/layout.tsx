import { requireAdmin } from "@/lib/requireAdmin";
import AdminShell from "@/components/admin/AdminShell";
import { headers } from "next/headers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";
  const isLoginPage = pathname === "/admin/login";

  // Protect the admin subtree, except for the login page
  if (!isLoginPage) {
    await requireAdmin();
  }

  return (
    <div className="admin-root">
      <AdminContentWrapper isLoginPage={isLoginPage}>{children}</AdminContentWrapper>
    </div>
  );
}

/**
 * Internal component to handle conditional shell rendering.
 * Using a simple conditional render to hide the shell on the login page.
 */
function AdminContentWrapper({
  children,
  isLoginPage,
}: {
  children: React.ReactNode;
  isLoginPage: boolean;
}) {
  if (isLoginPage) {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}
