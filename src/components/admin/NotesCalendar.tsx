"use client";

import { cn } from "@/lib/utils";

interface NotesCalendarProps {
  data: { date: string; count: number }[];
  isLoading: boolean;
}

export default function NotesCalendar({ data, isLoading }: NotesCalendarProps) {
  if (isLoading) {
    return (
      <div className="p-6 bg-surface-elevated rounded-xl border border-surface-border flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse flex space-x-2">
          <div className="h-4 w-4 bg-white/10 rounded"></div>
          <div className="h-4 w-4 bg-white/10 rounded"></div>
          <div className="h-4 w-4 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6 bg-surface-elevated rounded-xl border border-surface-border text-center text-slate-400 min-h-[200px] flex items-center justify-center">
        No calendar data available.
      </div>
    );
  }

  const getBlockColor = (count: number) => {
    if (count === 0) return "bg-surface-elevated border-surface-border/50";
    if (count <= 2) return "bg-brand-500/30 border-brand-500/20";
    if (count <= 5) return "bg-brand-500/60 border-brand-500/40";
    return "bg-brand-500 border-brand-500";
  };

  return (
    <div className="p-6 bg-surface-base rounded-xl border border-surface-border overflow-x-auto">
      <div className="min-w-max">
        <div className="grid grid-rows-7 grid-flow-col gap-1.5">
          {data.map((day) => (
            <div 
              key={day.date}
              title={`${day.date}: ${day.count} notes`}
              className={cn(
                "w-3.5 h-3.5 rounded-sm border tooltip-trigger hover:ring-2 hover:ring-white/20 transition-all",
                getBlockColor(day.count)
              )}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-end text-xs text-slate-500 space-x-2">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-surface-elevated border border-surface-border/50" />
          <div className="w-3 h-3 rounded-sm bg-brand-500/30 border border-brand-500/20" />
          <div className="w-3 h-3 rounded-sm bg-brand-500/60 border border-brand-500/40" />
          <div className="w-3 h-3 rounded-sm bg-brand-500 border border-brand-500" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
