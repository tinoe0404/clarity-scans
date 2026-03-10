import { PartyPopper } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonStyles } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { useAutoReset } from "@/hooks/useAutoReset";

interface ThankYouCardProps {
  anxietyBefore?: number | null;
  anxietyAfter?: number | null;
  onNewPatient: () => void;
}

export default function ThankYouCard({ 
  anxietyBefore, 
  anxietyAfter, 
  onNewPatient 
}: ThankYouCardProps) {
  const t = useTranslations("feedback");

  // 1. 30-Second global reset constraint natively dropping session configurations returning to Picker safely
  const { remainingTime, resetTimer } = useAutoReset(30000, onNewPatient);
  const progressPct = (remainingTime / 30) * 100;

  let anxietyMessage = null;
  if (anxietyBefore != null && anxietyAfter != null) {
    if (anxietyAfter < anxietyBefore) {
      anxietyMessage = `Your anxiety score went from ${anxietyBefore} to ${anxietyAfter} — great result!`;
    } else if (anxietyAfter === anxietyBefore) {
      anxietyMessage = `Your anxiety stayed stable at ${anxietyAfter}.`;
    } else {
      anxietyMessage = `We noted your score changed from ${anxietyBefore} to ${anxietyAfter}. Thank you for letting us know.`;
    }
  }

  return (
    <div 
      className="flex flex-col flex-1 w-full max-w-md mx-auto items-center justify-center py-6 px-4"
      onPointerDown={resetTimer} 
      onKeyDown={resetTimer}
    >
      <div className="flex flex-col items-center justify-center p-8 bg-brand-500/5 border border-brand-500/20 rounded-3xl w-full text-center relative overflow-hidden shadow-glow">
        
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50" />
        
        <div className="h-20 w-20 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center mb-6 animate-zoomIn">
          <PartyPopper className="h-10 w-10 animate-pulse" />
        </div>
        
        <h2 className="text-3xl font-bold font-display text-white mb-2 animate-slideUp" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          {t("thankYou")}
        </h2>
        
        <p className="text-slate-300 text-lg mb-6 animate-slideUp" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          {t("thankYouSub")}
        </p>

        {anxietyMessage && (
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 mb-8 w-full animate-slideUp" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            <p className="text-brand-300 text-sm font-medium">
              {anxietyMessage}
            </p>
          </div>
        )}

        <div className="w-full relative mt-4 animate-fadeIn" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
          
          <button
            onClick={onNewPatient}
            className={cn(buttonStyles("primary", "lg"), "w-full z-10 relative shadow-md")}
          >
            New Patient
          </button>
          
          {/* Subtle auto-reset progress indicator */}
          <div 
            className="absolute -bottom-4 left-0 h-1 bg-white/20 rounded-full w-full overflow-hidden"
            aria-hidden="true"
          >
            <div 
               className="h-full bg-slate-400 transition-all duration-1000 ease-linear rounded-full" 
               style={{ width: `${progressPct}%` }}
            />
          </div>
          
          {/* A11y countdown announcer updating gracefully every 10s */}
          <div 
             role="status" 
             aria-live="polite" 
             className="sr-only"
          >
             {remainingTime % 10 === 0 && remainingTime > 0 ? `Resetting in ${remainingTime} seconds` : ''}
          </div>

        </div>
      </div>
    </div>
  );
}
