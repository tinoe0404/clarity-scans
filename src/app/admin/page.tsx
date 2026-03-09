import { requireAdmin } from "@/lib/requireAdmin";

export default async function AdminDashboardPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl font-bold tracking-tight text-white">Dashboard</h2>
        <div className="rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-2 font-mono text-sm uppercase tracking-wider text-brand-400">
          Phase 17 Placeholder
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl border border-surface-border bg-surface-card"
          />
        ))}
      </div>

      <div className="flex h-64 items-center justify-center rounded-2xl border border-surface-border bg-surface-card">
        <p className="font-display text-gray-500">
          Full dashboard implementation coming in Phase 17
        </p>
      </div>
    </div>
  );
}
