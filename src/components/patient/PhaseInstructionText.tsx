import type { Locale } from "@/types";
import type { BreathPhase } from "@/hooks/useBreathHoldTrainer";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface PhaseInstructionTextProps {
  phase: BreathPhase;
  locale: Locale;
}

export default function PhaseInstructionText({ phase, locale }: PhaseInstructionTextProps) {
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
      className="h-12 mt-6 flex items-center justify-center w-full" 
      aria-live="assertive" 
      aria-atomic="true"
    >
      <span className={cn(
        "text-3xl text-center transition-opacity duration-300",
        styling,
        text === "" ? "opacity-0" : "opacity-100"
      )}>
        {text}
      </span>
    </div>
  );
}
