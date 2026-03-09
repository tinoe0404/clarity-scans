import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";

export default async function LoginPage() {
  const session = await getAdminSession();

  // If already logged in, redirect to dashboard
  if (session?.user.role === "admin") {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-base p-6">
      <LoginForm />
    </main>
  );
}
