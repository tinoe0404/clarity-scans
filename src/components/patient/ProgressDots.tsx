import { cn } from "@/lib/utils";

interface ProgressDotsProps {
  total: number;
  current: number;
  completed: number;
}

export default function ProgressDots({ total, current, completed }: ProgressDotsProps) {
  return (
    <div
      className="flex items-center justify-center gap-3"
      role="group"
      aria-label="Repetition progress"
    >
      {Array.from({ length: total }, (_, i) => {
        const isCompleted = i < completed;
        const isCurrent = i === current;

        return (
          <div
            key={i}
            className={cn(
              "h-3 w-3 rounded-full transition-all duration-300",
              isCompleted && "scale-100 bg-medical-green",
              isCurrent && !isCompleted && "scale-[1.4] bg-brand-400",
              !isCompleted && !isCurrent && "bg-white/10"
            )}
            aria-label={
              isCompleted
                ? `Round ${i + 1} complete`
                : isCurrent
                  ? `Round ${i + 1} in progress`
                  : `Round ${i + 1} pending`
            }
          >
            {isCompleted && (
              <span className="flex items-center justify-center text-[8px] font-bold text-white">
                ✓
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
