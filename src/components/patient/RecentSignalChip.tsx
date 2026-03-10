import type { SignalDefinition } from "@/lib/signalRegistry";
import { cn } from "@/lib/utils";

interface RecentSignalChipProps {
  signal: SignalDefinition;
  label: string;
  onClick: () => void;
}

export default function RecentSignalChip({ signal, label, onClick }: RecentSignalChipProps) {
  return (
    <button
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={label}
      className={cn(
        "flex items-center gap-2 rounded-full border px-4 min-h-[48px] transition-all hover:-translate-y-0.5 whitespace-nowrap w-fit shrink-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base focus-visible:ring-brand-500"
      )}
      style={{
        backgroundColor: `${signal.color}15`,
        borderColor: `${signal.color}40`,
        color: signal.textColor === "#000000" && signal.slug !== 'anxious' ? '#ffffff' : signal.color // Intelligent override keeping darkmode readability natively if textcolor maps inverse on full-screen
      }}
    >
      <span className="text-xl leading-none" aria-hidden="true">
        {signal.emoji}
      </span>
      <span className="font-display font-medium text-sm">
        {label}
      </span>
    </button>
  );
}
