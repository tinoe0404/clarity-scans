import { cn } from "@/lib/utils";

export type DateRangeOption = "week" | "month" | "all";

interface DateRangeSelectorProps {
  value: DateRangeOption;
  onChange: (value: DateRangeOption) => void;
}

export default function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const options: { id: DateRangeOption; label: string }[] = [
    { id: "week", label: "7 Days" },
    { id: "month", label: "30 Days" },
    { id: "all", label: "All Time" },
  ];

  return (
    <div 
      className="inline-flex rounded-lg bg-surface-elevated/50 p-1 border border-surface-border"
      role="radiogroup"
      aria-label="Date range selector"
    >
      {options.map((option) => {
        const isActive = value === option.id;
        return (
          <button
            key={option.id}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.id)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base",
              isActive 
                ? "bg-brand-500/20 text-brand-400 border border-brand-500/40 shadow-sm" 
                : "bg-transparent text-slate-400 hover:text-slate-300 hover:bg-white/[0.02] border border-transparent"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
