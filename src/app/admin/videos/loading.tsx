"use client";

import AdminShell from "@/components/admin/AdminShell";

export default function VideosLoading() {
  return (
    <AdminShell>
      <div className="animate-pulse space-y-8">
        {/* Storage bar skeleton */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="h-5 w-40 rounded bg-white/10" />
            <div className="h-5 w-24 rounded bg-white/10" />
          </div>
          <div className="h-3 w-full rounded-full bg-white/5">
            <div className="h-3 w-1/3 rounded-full bg-white/10" />
          </div>
          <div className="mt-3 flex gap-6">
            <div className="h-4 w-28 rounded bg-white/5" />
            <div className="h-4 w-28 rounded bg-white/5" />
          </div>
        </div>

        {/* Matrix skeleton */}
        <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface-card">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="p-4 text-left">
                  <div className="h-4 w-20 rounded bg-white/10" />
                </th>
                {[0, 1, 2].map((i) => (
                  <th key={i} className="p-4 text-center">
                    <div className="mx-auto h-4 w-16 rounded bg-white/10" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3, 4].map((row) => (
                <tr key={row} className="border-b border-surface-border last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white/10" />
                      <div className="h-4 w-24 rounded bg-white/10" />
                    </div>
                  </td>
                  {[0, 1, 2].map((col) => (
                    <td key={col} className="p-3">
                      <div className="h-[120px] rounded-xl border border-white/5 bg-white/5" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
