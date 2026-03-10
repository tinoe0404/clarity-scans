import type { BreathPhase } from "@/hooks/useBreathHoldTrainer";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface PhaseInstructionTextProps {
  phase: BreathPhase;
}

export default function PhaseInstructionText({ phase }: PhaseInstructionTextProps) {
  const t = useTranslations("breathhold");

  let text = "";
  let styling = "";

  switch (phase) {
    case "inhale":
      text = t("inhale");
      styling = "text-brand-400 font-bold";
      break;
    case "hold":
      text = t("hold");
      styling = "text-medical-amber font-bold animate-pulse";
      break;
    case "exhale":
      text = t("exhale");
      styling = "text-indigo-400 font-bold";
      break;
    case "rest":
      text = "...";
      styling = "text-slate-500";
      break;
    case "idle":
    case "complete":
    default:
      text = "";
      styling = "opacity-0";
      break;
  }

  return (
    <div
      className="mt-6 flex h-12 w-full items-center justify-center"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span
        className={cn(
          "text-center text-3xl transition-opacity duration-300",
          styling,
          text === "" ? "opacity-0" : "opacity-100"
        )}
      >
        {text}
      </span>
    </div>
  );
}
