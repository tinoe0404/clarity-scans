"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Video, BarChart3, FileText, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigation: NavItem[] = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Videos", href: "/admin/videos", icon: Video },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Patient Notes", href: "/admin/notes", icon: FileText },
  ];

  return (
    <div className="flex min-h-screen bg-surface-base text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:z-50 focus:rounded-full focus:bg-brand-500 focus:px-6 focus:py-3 focus:text-white focus:font-bold focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-surface-base"
      >
        Skip to main content
      </a>
      
      {/* Desktop Sidebar */}
      <aside className="fixed z-20 hidden h-full w-64 flex-col border-r border-surface-border bg-surface-card lg:flex">
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
                <item.icon className="h-5 w-5" aria-hidden="true" />
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
            <LogOut className="h-5 w-5" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 pb-24 lg:ml-64 lg:pb-0 outline-none">
        <div className="animate-in fade-in duration-normal mx-auto max-w-7xl p-6 lg:p-10">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="safe-area-inset-bottom fixed bottom-0 left-0 right-0 z-20 flex h-20 items-center justify-around border-t border-surface-border bg-surface-card px-4 lg:hidden">
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
          <span className="text-[10px] font-medium uppercase tracking-wider">Sign Out</span>
        </button>
      </nav>
    </div>
  );
}
