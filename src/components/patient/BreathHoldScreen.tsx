"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/types";
import { useTranslations } from "next-intl";
import { track } from "@vercel/analytics";

import { BREATH_HOLD_REPS } from "@/lib/constants";
import { addWatchedModule, getWatchedModules, getSessionId } from "@/lib/session";
import { useBreathHoldTrainer } from "@/hooks/useBreathHoldTrainer";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

import { AppShell, PatientHeader, TabNavigation } from "@/components/shared";
import AudioToggle from "./AudioToggle";
import BreathHoldIntroCard from "./BreathHoldIntroCard";
import BreathCircle from "./BreathCircle";
import ProgressDots from "./ProgressDots";
import PhaseInstructionText from "./PhaseInstructionText";
import BreathHoldCompletionCard from "./BreathHoldCompletionCard";
import { buttonStyles } from "@/lib/styles";
import { cn } from "@/lib/utils";

interface BreathHoldScreenProps {
  locale: Locale;
}

export default function BreathHoldScreen({ locale }: BreathHoldScreenProps) {
  const t = useTranslations();
  const reducedMotion = useReducedMotion();
  const [completedAt, setCompletedAt] = useState<Date | null>(null);

  // 1. Audio Mapping
  const { isAvailable, isEnabled, setEnabled, speak, cancel: cancelSpeech } = useSpeechSynthesis(locale);

  // 2. FSM Logic Mapping
  const trainer = useBreathHoldTrainer({
    onComplete: () => {
      const now = new Date();
      setCompletedAt(now);
      
      // Clinical Requirements
      addWatchedModule("breathhold");
      sessionStorage.setItem("cs_breathhold_completed_at", now.toISOString());
      track("breathhold_completed", { locale, reps: BREATH_HOLD_REPS });
      
      const sid = getSessionId();
      if (sid) {
        fetch(`/api/sessions/${sid}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completedModules: getWatchedModules() }),
        }).catch(() => {});
      }
    },
    onPhaseChange: (phase, _countdown) => {
      // Audio commands routing based on Locale mappings actively
      if (!isEnabled) return;
      
      switch (phase) {
        case "inhale":
          speak((t as any).raw("breathhold.inhale"));
          break;
        case "hold":
          speak((t as any).raw("breathhold.hold"));
          break;
        case "exhale":
          speak((t as any).raw("breathhold.exhale"));
          break;
        case "complete":
          speak((t as any).raw("breathhold.complete"));
          break;
      }
    }
  });

  // 3. Keyboard Bindings A11y
  useKeyboardShortcuts(
    {
      "Space": () => {
        if (trainer.state === "intro") trainer.start();
      },
      "Escape": () => {
        if (trainer.state === "running" || trainer.state === "resting") {
          trainer.cancel();
          cancelSpeech();
        }
      }
    },
    true
  );

  // Deriving the visual mapping contexts
  let currentPhaseLabel = "";
  if (trainer.state === "running" || trainer.state === "resting") {
     switch(trainer.breathPhase) {
        case "inhale": currentPhaseLabel = t("breathhold.inhale"); break;
        case "hold": currentPhaseLabel = t("breathhold.hold"); break;
        case "exhale": currentPhaseLabel = t("breathhold.exhale"); break;
        case "rest": currentPhaseLabel = t("breathhold.rest"); break;
     }
  }

  return (
    <AppShell locale={locale} className="flex flex-col h-screen overflow-hidden bg-surface-base">
      
      <PatientHeader 
        locale={locale} 
        title={t("nav.home")} 
        showBack={true}
        backHref={`/${locale}/modules`}
        rightAction={
          <AudioToggle 
            isAvailable={isAvailable}
            isEnabled={isEnabled}
            onToggle={() => setEnabled(!isEnabled)}
          />
        }
      />

      <TabNavigation locale={locale} activeTab="breathhold" />

      {/* Primary Orchestration Bounds strictly constraining jumping */}
      <div className="flex-1 overflow-y-auto px-4 w-full h-full min-h-[360px] custom-scrollbar flex flex-col pt-4 pb-24">
        
        {trainer.state === "intro" && (
          <BreathHoldIntroCard
            locale={locale}
            onStart={trainer.start}
            reducedMotion={reducedMotion}
          />
        )}

        {(trainer.state === "running" || trainer.state === "resting") && (
          <div className="flex flex-col items-center justify-center flex-1 py-8 w-full max-w-md mx-auto">
            
            <BreathCircle
              phase={trainer.breathPhase}
              countdown={trainer.countdown}
              label={currentPhaseLabel}
            />
            
            <div className="mt-8 mb-4">
              <ProgressDots
                total={BREATH_HOLD_REPS}
                current={trainer.currentRep}
                completed={trainer.currentRep} // The FSM handles the exact index mappings automatically
              />
            </div>
            
            <PhaseInstructionText 
              phase={trainer.breathPhase} 
              locale={locale} 
            />

            {trainer.state === "running" && (
              <button
                 onClick={() => {
                   trainer.cancel();
                   cancelSpeech();
                 }}
                 className={cn(buttonStyles("ghost", "sm"), "mt-8 text-slate-400 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20")}
              >
                 Stop practice (Esc)
              </button>
            )}
          </div>
        )}

        {trainer.state === "cancelled" && (
          <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto py-8">
             <div className="bg-surface-elevated/50 border border-white/10 p-6 rounded-3xl text-center w-full mb-8">
               <span className="text-4xl mb-4 block" aria-hidden="true">⏸️</span>
               <h3 className="text-xl font-bold text-white mb-2">Practice stopped</h3>
               <p className="text-slate-400">You can start again whenever you're ready.</p>
             </div>
             
             <button
               onClick={trainer.start}
               className={cn(buttonStyles("primary", "lg"), "w-full mx-2")}
             >
               Start Again (Space)
             </button>
          </div>
        )}

        {trainer.state === "complete" && completedAt && (
          <BreathHoldCompletionCard 
            locale={locale} 
            completedAt={completedAt} 
            onTryAgain={trainer.reset}
          />
        )}

      </div>
    </AppShell>
  );
}
