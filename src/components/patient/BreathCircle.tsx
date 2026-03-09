import { cn } from "@/lib/utils";

interface BreathCircleProps {
  phase: "idle" | "inhale" | "hold" | "exhale" | "complete";
  countdown: number;
  label: string;
}

const PHASE_CONFIG = {
  idle: {
    emoji: "🧘",
    border: "border-brand-500/40",
    scale: "scale-100",
    animate: "",
  },
  inhale: {
    emoji: "🌬️",
    border: "border-brand-400",
    scale: "scale-[1.2]",
    animate: "animate-breatheIn",
  },
  hold: {
    emoji: "🫁",
    border: "border-medical-amber",
    scale: "scale-[1.2]",
    animate: "",
  },
  exhale: {
    emoji: "💨",
    border: "border-indigo-500",
    scale: "scale-90",
    animate: "animate-breatheOut",
  },
  complete: {
    emoji: "✅",
    border: "border-medical-green",
    scale: "scale-100",
    animate: "",
  },
} as const;

export default function BreathCircle({ phase, countdown, label }: BreathCircleProps) {
  const config = PHASE_CONFIG[phase];

  return (
    <div className="relative mx-auto flex h-[220px] w-[220px] items-center justify-center">
      {/* Decorative pulsing ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-full border-2 opacity-20",
          config.border,
          phase !== "idle" && phase !== "complete" && "animate-pulse"
        )}
        aria-hidden="true"
      />

      {/* Main circle */}
      <div
        className={cn(
          "relative flex h-[200px] w-[200px] flex-col items-center justify-center gap-2 rounded-full border-4 bg-surface-elevated/50 backdrop-blur-sm",
          "transition-transform duration-1000 ease-in-out",
          config.border,
          config.scale,
          config.animate
        )}
        role="img"
        aria-label={`${label} — ${countdown} seconds remaining`}
      >
        <span className="text-4xl" aria-hidden="true">
          {config.emoji}
        </span>
        <span className="font-display text-sm font-semibold text-slate-300">{label}</span>
        {phase !== "idle" && phase !== "complete" && (
          <span className="font-mono text-3xl font-bold text-brand-400">{countdown}</span>
        )}
      </div>
    </div>
  );
}
