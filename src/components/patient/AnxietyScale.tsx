"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnxietyScaleProps {
  value: 1 | 2 | 3 | 4 | 5 | null;
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
  disabled?: boolean;
}

const SCALE_OPTIONS: { value: 1 | 2 | 3 | 4 | 5; emoji: string }[] = [
  { value: 1, emoji: "😌" },
  { value: 2, emoji: "🙂" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "😟" },
  { value: 5, emoji: "😨" },
];

export default function AnxietyScale({ value, onChange, disabled = false }: AnxietyScaleProps) {
  const groupRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: number) => {
      if (disabled) return;
      let nextIdx = idx;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextIdx = (idx + 1) % SCALE_OPTIONS.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        nextIdx = (idx - 1 + SCALE_OPTIONS.length) % SCALE_OPTIONS.length;
      }

      if (nextIdx !== idx) {
        const nextOption = SCALE_OPTIONS[nextIdx];
        if (nextOption) {
          onChange(nextOption.value);
        }
        // Focus the new button
        const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>("[role=radio]");
        buttons?.[nextIdx]?.focus();
      }
    },
    [disabled, onChange]
  );

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Anxiety level"
      className="flex items-stretch gap-2"
    >
      {SCALE_OPTIONS.map((opt, idx) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`Level ${opt.value}`}
            tabIndex={isSelected || (value === null && idx === 0) ? 0 : -1}
            disabled={disabled}
            onClick={() => !disabled && onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-3 transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50",
              isSelected
                ? "border-brand-500/40 bg-brand-500/15 text-brand-400"
                : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/20",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <span className="text-2xl" aria-hidden="true">
              {opt.emoji}
            </span>
            <span className="font-mono text-[11px] font-semibold">{opt.value}</span>
          </button>
        );
      })}
    </div>
  );
}
