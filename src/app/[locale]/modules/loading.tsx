import { AppShell } from "@/components/shared";
import { SkeletonCard } from "@/components/ui/Skeleton";
import PatientHeader from "@/components/patient/PatientHeader";
import TabNavigation from "@/components/patient/TabNavigation";

export default function ModulesLoading() {
  return (
    <AppShell locale="en" className="flex flex-col h-screen overflow-hidden">
      <div className="shrink-0 flex flex-col z-20 shadow-sm relative w-full pointer-events-none">
        
        {/* Skeleton Version of the patient header */}
        <header className="bg-gradient-to-b from-surface-elevated to-surface-card px-6 pb-6 pt-8">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-6 w-32 rounded bg-surface-border animate-pulse" />
              <div className="h-4 w-48 rounded bg-surface-border/50 animate-pulse" />
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 h-3 w-24 rounded bg-surface-border animate-pulse" />
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]" />
          </div>
        </header>
        
        <div className="bg-gradient-to-b from-surface-elevated to-surface-card pt-0 pb-2 shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
          <TabNavigation locale="en" activeTab="modules" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full pb-12 pt-6 custom-scrollbar px-6 space-y-3 pointer-events-none">
         {Array.from({ length: 5 }).map((_, i) => (
           <SkeletonCard key={i} />
         ))}
      </div>
    </AppShell>
  );
}
