"use client";

import AdminShell from "@/components/admin/AdminShell";

export default function AnalyticsLoading() {
  return (
    <AdminShell>
      <div className="space-y-8 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-56 rounded bg-white/10" />
          <div className="flex gap-2">
            <div className="h-10 w-24 rounded-lg bg-white/10" />
            <div className="h-10 w-24 rounded-lg bg-white/10" />
          </div>
        </div>

        {/* Summary cards skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-surface-border bg-surface-card p-6">
              <div className="mb-2 h-4 w-32 rounded bg-white/10" />
              <div className="h-10 w-20 rounded bg-white/10" />
            </div>
          ))}
        </div>

        {/* Charts skeleton row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-[320px] rounded-2xl border border-surface-border bg-surface-card" />
          <div className="h-[320px] rounded-2xl border border-surface-border bg-surface-card" />
        </div>

        {/* Trend chart skeleton */}
        <div className="h-[280px] rounded-2xl border border-surface-border bg-surface-card" />

        {/* Donuts skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="h-[260px] rounded-2xl border border-surface-border bg-surface-card" />
          <div className="h-[260px] rounded-2xl border border-surface-border bg-surface-card" />
        </div>

        {/* Table skeleton */}
        <div className="h-[400px] rounded-2xl border border-surface-border bg-surface-card" />
      </div>
    </AdminShell>
  );
}
