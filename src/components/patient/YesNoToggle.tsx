"use client";

import { cn } from "@/lib/utils";

interface YesNoToggleProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  yesLabel: string;
  noLabel: string;
  disabled?: boolean;
}

export default function YesNoToggle({
  value,
  onChange,
  yesLabel,
  noLabel,
  disabled = false,
}: YesNoToggleProps) {
  return (
    <div role="radiogroup" aria-label="Yes or No" className="flex gap-3">
      <button
        type="button"
        role="radio"
        aria-checked={value === true}
        disabled={disabled}
        onClick={() => !disabled && onChange(true)}
        className={cn(
          "flex-1 rounded-xl border py-4 font-display text-base font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50",
          value === true
            ? "border-medical-green/40 bg-medical-green/15 text-medical-green"
            : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/20",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        {yesLabel}
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={value === false}
        disabled={disabled}
        onClick={() => !disabled && onChange(false)}
        className={cn(
          "flex-1 rounded-xl border py-4 font-display text-base font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50",
          value === false
            ? "border-medical-red/40 bg-medical-red/15 text-medical-red"
            : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/20",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        {noLabel}
      </button>
    </div>
  );
}
