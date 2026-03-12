import AdminShell from "@/components/admin/AdminShell";

export default function AdminLoading() {
  return (
    <AdminShell>
      <div className="flex flex-col h-full bg-surface-base pb-10">
        
        {/* Mock AdminHeader */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-surface-border bg-surface-base px-6">
          <div className="flex items-center gap-4">
             <div className="h-6 w-32 bg-white/5 animate-pulse rounded" />
             <div className="h-6 w-px bg-surface-border hidden sm:block" />
             <div className="h-6 w-24 bg-white/5 animate-pulse rounded" />
          </div>
          <div className="flex gap-4">
             <div className="h-4 w-24 bg-white/5 animate-pulse rounded mt-1" />
             <div className="h-8 w-8 bg-white/5 animate-pulse rounded-full" />
          </div>
        </header>
        
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white tracking-tight">Overview</h2>
            <div className="h-10 w-64 bg-surface-elevated animate-pulse rounded-lg border border-surface-border" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-surface-border bg-surface-elevated p-5 h-[130px] flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="h-9 w-9 bg-white/5 rounded-xl animate-pulse" />
                </div>
                <div>
                  <div className="h-4 w-28 bg-white/5 rounded mt-3 mb-2 animate-pulse" />
                  <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[350px] rounded-2xl border border-surface-border bg-surface-elevated animate-pulse" />
            <div className="lg:col-span-1 h-[350px] rounded-2xl border border-surface-border bg-surface-elevated animate-pulse" />
          </div>

        </main>
      </div>
    </AdminShell>
  );
}
