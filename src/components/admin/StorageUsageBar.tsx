"use client";

import { useMemo } from "react";
import { HardDrive, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";
import type { StorageStats } from "@/types";
import { FREE_TIER_LIMIT_BYTES } from "@/lib/constants";

interface StorageUsageBarProps {
  stats: StorageStats | null;
  onCleanup: () => void;
}

export default function StorageUsageBar({ stats, onCleanup }: StorageUsageBarProps) {
  const { color, label } = useMemo(() => {
    if (!stats) return { color: "bg-white/20", label: "Loading..." };
    const pct = stats.percentUsed;
    if (pct >= 80) return { color: "bg-medical-red", label: "Critical" };
    if (pct >= 60) return { color: "bg-medical-amber", label: "Warning" };
    return { color: "bg-medical-green", label: "Healthy" };
  }, [stats]);

  if (!stats) {
    return (
      <div className="animate-pulse rounded-2xl border border-surface-border bg-surface-card p-6">
        <div className="h-4 w-48 rounded bg-white/10" />
        <div className="mt-3 h-3 rounded-full bg-white/5" />
      </div>
    );
  }

  const limitMB = (FREE_TIER_LIMIT_BYTES / (1024 * 1024)).toFixed(0);

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-slate-400" />
          <span className="font-medium text-white">Storage Usage</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              stats.percentUsed >= 80
                ? "bg-medical-red/10 text-medical-red"
                : stats.percentUsed >= 60
                  ? "bg-medical-amber/10 text-medical-amber"
                  : "bg-medical-green/10 text-medical-green"
            )}
          >
            {label}
          </span>
        </div>
        <span className="text-sm text-slate-400">
          {stats.totalMB.toFixed(1)} MB / {limitMB} MB ({stats.percentUsed.toFixed(1)}%)
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${Math.min(stats.percentUsed, 100)}%` }}
        />
      </div>

      {/* Breakdown + cleanup */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-6 text-xs text-slate-500">
          <span>{stats.videoCount} videos</span>
          <span>{stats.thumbnailCount} thumbnails</span>
        </div>
        <button
          onClick={onCleanup}
          className={cn(buttonStyles("secondary", "sm"), "flex items-center gap-1.5 text-xs")}
        >
          <Trash2 className="h-3 w-3" />
          Clean Up Storage
        </button>
      </div>
    </div>
  );
}
