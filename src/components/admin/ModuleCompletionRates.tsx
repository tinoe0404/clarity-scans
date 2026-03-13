"use client";

import { useMemo } from "react";
import { MODULE_REGISTRY } from "@/lib/moduleRegistry";
import { cn } from "@/lib/utils";

interface ModuleRate {
  moduleId: string;
  completions: number;
  rate: number;
}

interface ModuleCompletionRatesProps {
  data: ModuleRate[];
}

export default function ModuleCompletionRates({ data }: ModuleCompletionRatesProps) {
  const sortedModules = useMemo(() => {
    // We map through the registry exactly maintaining natural order defined by Phase 8 specifications
    return MODULE_REGISTRY.map((mod) => {
      const match = data.find((d) => d.moduleId === mod.slug);
      const rate = match?.rate || 0;
      const ratePercent = Math.round(rate * 100);
      
      return {
        id: mod.slug,
        title: mod.slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        icon: mod.icon,
        ratePercent,
        isBreathhold: mod.slug === "breathhold", 
      };
    });
  }, [data]);

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-elevated overflow-hidden h-full flex flex-col">
      <div className="border-b border-surface-border p-5">
        <h3 className="text-base font-semibold text-white">Module Completion Rates</h3>
      </div>
      
      <div className="p-5 flex-1 flex flex-col justify-center gap-6">
        {sortedModules.map((mod) => {
          const Icon = mod.icon;
          
          return (
            <div key={mod.id} className="relative">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1.5 rounded-lg border",
                    mod.isBreathhold ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-surface-base border-surface-border text-slate-400"
                  )}>
                    <span className="h-4 w-4 flex items-center justify-center text-sm" aria-hidden="true">{Icon}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-200">
                    {mod.title}
                  </span>
                </div>
                <span className="text-sm font-bold text-white">
                  {mod.ratePercent}%
                </span>
              </div>
              
              <div className="h-2 w-full bg-surface-base rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    mod.isBreathhold ? "bg-amber-500" : "bg-brand-500"
                  )}
                  style={{ width: `${mod.ratePercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
