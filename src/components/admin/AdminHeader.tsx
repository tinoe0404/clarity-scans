"use client";

import { useSession } from "next-auth/react";
import { RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { Logo } from "@/components/shared";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  title: string;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function AdminHeader({ title, lastUpdated, onRefresh, isRefreshing }: AdminHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      router.refresh();
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-surface-border bg-surface-base px-6">
      <div className="flex items-center gap-4">
        <Logo className="h-6 w-auto text-brand-500 hidden sm:block" />
        <div className="h-6 w-px bg-surface-border hidden sm:block" />
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {session?.user?.name && (
          <span className="hidden md:inline-block text-sm font-medium text-slate-400">
            {session.user.name}
          </span>
        )}

        {lastUpdated && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="hidden sm:inline">Last updated:</span>
            <span>{format(lastUpdated, "HH:mm")}</span>
          </div>
        )}

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={cn(
            "rounded-full p-2 text-slate-400 hover:bg-white/[0.04] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            isRefreshing && "animate-spin"
          )}
          title="Refresh dashboard"
          aria-label="Refresh dashboard"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
