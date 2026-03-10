import { ArrowRight } from "lucide-react";
import type { Locale } from "@/types";
import { useTranslations } from "next-intl";
import { buttonStyles } from "@/lib/styles";
import { BREATH_HOLD_REPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface BreathHoldIntroCardProps {
  locale: Locale;
  onStart: () => void;
  reducedMotion?: boolean;
}

export default function BreathHoldIntroCard({ locale, onStart, reducedMotion = false }: BreathHoldIntroCardProps) {
  const t = useTranslations("breathhold");

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto py-8">
      
      <div className={cn("text-center mb-8", !reducedMotion && "animate-slideUp")} style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <h2 className="font-display text-3xl font-bold text-white mb-2">
          {t("title")}
        </h2>
        <p className="text-brand-300 font-medium text-lg mb-2">
          {t("subtitle")}
        </p>
        <p className="text-slate-400">
          {t("instruction")}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 w-full mb-8">
        {/* Step 1 */}
        <div className={cn("flex flex-col items-center gap-1 bg-surface-elevated/50 p-4 rounded-2xl border border-brand-500/20 w-[100px]", !reducedMotion && "animate-zoomIn")} style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <span className="text-2xl" aria-hidden="true">🌬️</span>
          <span className="text-sm font-bold text-brand-400">{t("inhale").replace('!', '')}</span>
          <span className="text-xs text-slate-500">3 sec</span>
        </div>

        <ArrowRight className={cn("text-slate-600 h-5 w-5", !reducedMotion && "animate-fadeIn")} style={{ animationDelay: '300ms', animationFillMode: 'both' }} />

        {/* Step 2 */}
        <div className={cn("flex flex-col items-center gap-1 bg-surface-elevated/50 p-4 rounded-2xl border border-medical-amber/30 w-[100px]", !reducedMotion && "animate-zoomIn")} style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
           <span className="text-2xl" aria-hidden="true">🫁</span>
           <span className="text-sm font-bold text-medical-amber">{t("hold").replace('!', '')}</span>
           <span className="text-xs text-slate-500">7 sec</span>
        </div>

        <ArrowRight className={cn("text-slate-600 h-5 w-5", !reducedMotion && "animate-fadeIn")} style={{ animationDelay: '500ms', animationFillMode: 'both' }} />

        {/* Step 3 */}
        <div className={cn("flex flex-col items-center gap-1 bg-surface-elevated/50 p-4 rounded-2xl border border-indigo-500/30 w-[100px]", !reducedMotion && "animate-zoomIn")} style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
           <span className="text-2xl" aria-hidden="true">💨</span>
           <span className="text-sm font-bold text-indigo-400">{t("exhale").replace('!', '')}</span>
           <span className="text-xs text-slate-500">3 sec</span>
        </div>
      </div>

      <div className={cn("bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 text-center mb-8 w-full", !reducedMotion && "animate-slideUp")} style={{ animationDelay: '700ms', animationFillMode: 'both' }}>
         <p className="text-slate-300 text-sm mb-1">
           You will practise this <strong className="text-white">{BREATH_HOLD_REPS} times</strong>
         </p>
         <p className="text-sm text-slate-500 italic">
           {t("tip")}
         </p>
      </div>

      <div className={cn("w-full mt-auto mt-4 px-2", !reducedMotion && "animate-slideUp")} style={{ animationDelay: '800ms', animationFillMode: 'both' }}>
        <button
          onClick={onStart}
          className={cn(buttonStyles("primary", "lg"), "w-full shadow-glow py-4 text-lg")}
        >
          {t("practise")} <span className="opacity-50">(Space)</span>
        </button>
      </div>
      
    </div>
  );
}
