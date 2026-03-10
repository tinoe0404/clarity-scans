import { useEffect, useState } from "react";
import Link from "next/link";
import { isModuleWatched } from "@/lib/session";
import type { Locale } from "@/types";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";
import AllDoneCard from "./AllDoneCard";

interface BreathHoldCompletionCardProps {
  locale: Locale;
  completedAt: Date;
  onTryAgain: () => void;
}

export default function BreathHoldCompletionCard({ 
  locale, 
  completedAt, 
  onTryAgain 
}: BreathHoldCompletionCardProps) {
  const t = useTranslations("breathhold");
  const [reachedViaModule, setReachedViaModule] = useState(false);

  useEffect(() => {
    // If breathhold is physically listed in local session, the downstream CTA is valid
    setReachedViaModule(isModuleWatched("breathhold"));
  }, []);

  const timeString = new Intl.DateTimeFormat(locale, {
    timeZone: "Africa/Harare",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(completedAt);

  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto items-center justify-center py-6 px-2">
      <div className="flex flex-col items-center justify-center p-8 bg-medical-green/5 border border-medical-green/20 rounded-3xl w-full text-center relative overflow-hidden shadow-[0_0_30px_rgba(22,163,74,0.1)]">
        
        {/* Decorative Success Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-medical-green to-transparent opacity-50" />
        
        <div className="text-[80px] leading-none mb-6 animate-slideUp">✅</div>
        
        <h2 className="text-3xl font-bold font-display text-medical-green mb-2">
          {t("complete")}
        </h2>
        
        <p className="text-slate-300 text-lg mb-6 max-w-[260px]">
          {t("completeSub")}
        </p>

        <div className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8">
           <span className="font-mono text-xs text-slate-400">
             Completed at {timeString}
           </span>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-[280px]">
          <button
            onClick={onTryAgain}
            className={cn(buttonStyles("ghost", "lg"), "border border-white/10 text-slate-300")}
          >
            Practise Again
          </button>
          
          <Link
            href={`/${locale}/modules`}
            className={cn(buttonStyles("primary", "lg"), "w-full")}
          >
            Back to Modules
          </Link>
        </div>
      </div>

      {reachedViaModule && (
        <div className="mt-8 w-full animate-fadeIn" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
           <AllDoneCard locale={locale} />
        </div>
      )}
    </div>
  );
}
