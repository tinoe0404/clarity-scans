import { AppShell } from "@/components/shared";

export default function VideoPlayerLoading() {
  return (
    <AppShell locale="en" className="flex flex-col h-screen overflow-hidden bg-surface-base">
      
      <div className="shrink-0 relative z-20">
        <div className="relative w-full aspect-video bg-surface-elevated flex items-center justify-center overflow-hidden">
           <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
             <div className="flex h-[72px] w-[72px] animate-pulse items-center justify-center rounded-full bg-black/40">
                {/* Visual anchor point matching size footprint */}
             </div>
           </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-surface-card border-b border-surface-border h-[88px]">
          <div className="h-3 w-32 bg-surface-border rounded animate-pulse mb-3" />
          <div className="flex gap-3">
             <div className="h-8 w-16 bg-surface-border rounded-full animate-pulse" />
             <div className="h-8 w-16 bg-surface-border rounded-full animate-pulse" />
             <div className="h-8 w-16 bg-surface-border rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full p-6 relative">
         <div className="h-8 w-3/4 mb-4 bg-surface-border rounded animate-pulse" />
         <div className="h-4 w-full mb-2 bg-surface-border/50 rounded animate-pulse" />
         <div className="h-4 w-5/6 mb-8 bg-surface-border/50 rounded animate-pulse" />

         <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="h-3 w-20 mb-4 bg-surface-border rounded animate-pulse" />
            <div className="space-y-4">
              <div className="flex gap-3"><div className="w-2 h-2 mt-1 rounded-full bg-surface-border animate-pulse"/><div className="h-4 w-full bg-surface-border/50 rounded animate-pulse" /></div>
              <div className="flex gap-3"><div className="w-2 h-2 mt-1 rounded-full bg-surface-border animate-pulse"/><div className="h-4 w-5/6 bg-surface-border/50 rounded animate-pulse" /></div>
              <div className="flex gap-3"><div className="w-2 h-2 mt-1 rounded-full bg-surface-border animate-pulse"/><div className="h-4 w-11/12 bg-surface-border/50 rounded animate-pulse" /></div>
            </div>
         </div>
      </div>

      <div className="shrink-0 absolute bottom-0 left-0 right-0 z-30 bg-surface-card border-t border-white/[0.06] px-6 py-4 pb-8">
        <div className="flex flex-col gap-3">
          <div className="h-[52px] w-full bg-brand-500/20 rounded-xl animate-pulse" />
          <div className="h-[44px] w-full bg-surface-border/50 rounded-xl animate-pulse" />
        </div>
      </div>
      
    </AppShell>
  );
}
