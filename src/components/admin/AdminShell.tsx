"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Video, BarChart3, FileText, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface NavItem {
  label: string;
  href: Route;
  icon: React.ElementType;
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("admin.nav");

  const navigation: NavItem[] = [
    { label: t("dashboard"), href: "/admin" as Route, icon: LayoutDashboard },
    { label: t("videos"), href: "/admin/videos" as Route, icon: Video },
    { label: t("analytics"), href: "/admin/analytics" as Route, icon: BarChart3 },
    { label: t("notes"), href: "/admin/notes" as Route, icon: FileText },
  ];

  return (
    <div className="flex min-h-screen bg-surface-base text-white">
      {/* Desktop Sidebar */}
      <aside className="fixed z-20 hidden h-full w-64 flex-col border-r border-surface-border bg-surface-card md:flex">
        <div className="p-8">
          <h1 className="font-display text-2xl font-bold">
            Clarity<span className="text-brand-500">Scans</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "duration-fast flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all",
                  isActive
                    ? "bg-brand-500/10 text-brand-400"
                    : "text-gray-400 hover:bg-surface-elevated hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-surface-border p-4">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="duration-fast flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-gray-400 transition-all hover:bg-medical-red/5 hover:text-medical-red"
          >
            <LogOut className="h-5 w-5" />
            {t("logout")}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:ml-64 md:pb-0">
        <div className="animate-in fade-in duration-normal mx-auto max-w-7xl p-6 md:p-10">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="safe-area-inset-bottom fixed bottom-0 left-0 right-0 z-20 flex h-20 items-center justify-around border-t border-surface-border bg-surface-card px-4 md:hidden">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[64px] flex-col items-center gap-1 transition-colors",
                isActive ? "text-brand-400" : "text-gray-400"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex min-w-[64px] flex-col items-center gap-1 text-gray-400"
        >
          <LogOut className="h-6 w-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">{t("logout")}</span>
        </button>
      </nav>
    </div>
  );
}
