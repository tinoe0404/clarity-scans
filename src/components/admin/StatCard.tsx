import { ReactNode } from "react";
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { SkeletonBlock } from "@/components/shared";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value?: number | string | null;
  unit?: string;
  trendDirection?: "up" | "down" | "neutral" | null;
  trendPercentage?: number | null;
  icon: ReactNode;
  accentColor: string; // e.g., 'bg-brand-500', 'bg-medical-green'
  isLoading?: boolean;
  tooltipText?: string;
  invertedTrend?: boolean; // If true, "down" is good (green) and "up" is bad (red)
}

export default function StatCard({
  title,
  value,
  unit,
  trendDirection,
  trendPercentage,
  icon,
  accentColor,
  isLoading = false,
  tooltipText,
  invertedTrend = false,
}: StatCardProps) {
  
  // Determine trend colors based on inversion logic
  let trendColor = "text-slate-400";
  let TrendIcon = Minus;

  if (trendDirection === "up") {
    trendColor = invertedTrend ? "text-red-400" : "text-medical-green";
    TrendIcon = TrendingUp;
  } else if (trendDirection === "down") {
    trendColor = invertedTrend ? "text-medical-green" : "text-red-400";
    TrendIcon = TrendingDown;
  }

  const hasTrend = trendDirection && trendDirection !== "neutral" && trendPercentage !== null && trendPercentage !== undefined;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface-elevated p-5 transition-all hover:bg-surface-elevated/80">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2.5 rounded-xl text-white shadow-lg", accentColor)}>
          {icon}
        </div>
        
        {tooltipText && (
          <div className="group relative">
            <button className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <Info className="h-4 w-4" />
              <span className="sr-only">More info about {title}</span>
            </button>
            <div className="pointer-events-none absolute right-0 top-full z-10 mt-2 w-48 opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100">
              <div className="rounded-lg bg-slate-800 border border-slate-700 p-2.5 text-xs text-slate-200 shadow-xl whitespace-normal text-left">
                {tooltipText}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-medium text-slate-400 line-clamp-1">{title}</h3>
        
        <div className="flex items-baseline gap-1.5">
          {isLoading ? (
            <SkeletonBlock className="h-8 w-24 my-1 rounded-md bg-white/5" />
          ) : (
            <>
              <span className="text-3xl font-bold tracking-tight text-white">
                {value === null || value === undefined ? "—" : value}
              </span>
              {unit && value !== null && value !== undefined && (
                <span className="text-sm font-medium text-slate-500">{unit}</span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center h-5">
        {!isLoading && value !== null && value !== undefined && hasTrend ? (
          <div className={cn("flex items-center text-xs font-medium", trendColor)}>
            <TrendIcon className="h-3.5 w-3.5 mr-1" />
            <span>{trendPercentage}% from last period</span>
          </div>
        ) : !isLoading && value !== null && value !== undefined ? (
          <span className="text-xs font-medium text-slate-500">No previous data</span>
        ) : null}
      </div>
    </div>
  );
}
