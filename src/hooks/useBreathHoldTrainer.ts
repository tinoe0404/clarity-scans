import { useState, useRef, useEffect, useCallback } from "react";
import { BREATH_HOLD_TIMING, BREATH_HOLD_REPS } from "@/lib/constants";

export type BreathPhase = 
  | "idle" 
  | "inhale" 
  | "hold" 
  | "exhale" 
  | "rest" 
  | "complete";

export type TrainerState = 
  | "intro"
  | "running"
  | "resting"
  | "complete"
  | "cancelled";

interface UseBreathHoldTrainerOptions {
  onRepComplete?: (repNumber: number) => void;
  onComplete?: () => void;
  onPhaseChange?: (phase: BreathPhase, countdown: number) => void;
}

interface UseBreathHoldTrainerReturn {
  state: TrainerState;
  currentRep: number;
  breathPhase: BreathPhase;
  countdown: number;
  start: () => void;
  cancel: () => void;
  reset: () => void;
}

export function useBreathHoldTrainer({
  onRepComplete,
  onComplete,
  onPhaseChange,
}: UseBreathHoldTrainerOptions): UseBreathHoldTrainerReturn {
  const [state, setState] = useState<TrainerState>("intro");
  const [currentRep, setCurrentRep] = useState(0);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>("idle");
  const [countdown, setCountdown] = useState(0);

  // Single source of truth for all timer operations
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to reliably clear the current timer
  const clearCurrentTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearCurrentTimer();
  }, [clearCurrentTimer]);

  // Expose current state to the recursive loops without stale closure issues
  const stateRef = useRef({ currentRep, breathPhase, countdown });
  useEffect(() => {
    stateRef.current = { currentRep, breathPhase, countdown };
  }, [currentRep, breathPhase, countdown]);

  const scheduleNextTick = useCallback((
    targetPhase: BreathPhase,
    targetCountdown: number,
    targetRep: number
  ) => {
    clearCurrentTimer();
    
    timerRef.current = setTimeout(() => {
      // 1. Tick
      if (targetCountdown > 1) {
        setCountdown(targetCountdown - 1);
        scheduleNextTick(targetPhase, targetCountdown - 1, targetRep);
        return;
      }

      // 2. Phase Transitions when countdown hits 0 (or technically 1 above transitioning)
      let nextPhase: BreathPhase = "idle";
      let nextCountdown = 0;
      let nextRep = targetRep;

      switch (targetPhase) {
        case "inhale":
          nextPhase = "hold";
          nextCountdown = BREATH_HOLD_TIMING.hold;
          break;
        case "hold":
          nextPhase = "exhale";
          nextCountdown = BREATH_HOLD_TIMING.exhale;
          break;
        case "exhale":
          if (nextRep >= BREATH_HOLD_REPS - 1) {
            // All reps done
            setBreathPhase("complete");
            setCountdown(0);
            setState("complete");
            setCurrentRep(nextRep + 1);
            if (onRepComplete) onRepComplete(nextRep);
            if (onPhaseChange) onPhaseChange("complete", 0);
            if (onComplete) onComplete();
            return; // Halt chain
          } else {
             // Go to rest
             nextPhase = "rest";
             nextCountdown = BREATH_HOLD_TIMING.rest;
             setState("resting");
             if (onRepComplete) onRepComplete(nextRep);
          }
          break;
        case "rest":
          // Back to inhale for next rep
          nextPhase = "inhale";
          nextCountdown = BREATH_HOLD_TIMING.inhale;
          nextRep = targetRep + 1;
          setCurrentRep(nextRep);
          setState("running");
          break;
         default:
           return;
      }

      // 3. Execute Transition
      setBreathPhase(nextPhase);
      setCountdown(nextCountdown);
      
      if (onPhaseChange) {
        onPhaseChange(nextPhase, nextCountdown);
      }
      
      scheduleNextTick(nextPhase, nextCountdown, nextRep);
      
    }, 1000);
  }, [clearCurrentTimer, onRepComplete, onComplete, onPhaseChange]);

  // Pause on visibility change (tab hidden) — prevents timer drift on hospital tablets
  const pausedPhaseRef = useRef<{ phase: BreathPhase; countdown: number; rep: number } | null>(null);
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && state === "running") {
        pausedPhaseRef.current = {
          phase: stateRef.current.breathPhase,
          countdown: stateRef.current.countdown,
          rep: stateRef.current.currentRep,
        };
        clearCurrentTimer();
      } else if (!document.hidden && pausedPhaseRef.current && state === "running") {
        const { phase, countdown: cd, rep } = pausedPhaseRef.current;
        pausedPhaseRef.current = null;
        scheduleNextTick(phase, cd, rep);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [state, clearCurrentTimer, scheduleNextTick]);

  const start = useCallback(() => {
    clearCurrentTimer();
    setState("running");
    setCurrentRep(0);
    setBreathPhase("inhale");
    setCountdown(BREATH_HOLD_TIMING.inhale);
    
    if (onPhaseChange) {
      onPhaseChange("inhale", BREATH_HOLD_TIMING.inhale);
    }
    
    scheduleNextTick("inhale", BREATH_HOLD_TIMING.inhale, 0);
  }, [clearCurrentTimer, scheduleNextTick, onPhaseChange]);

  const cancel = useCallback(() => {
    clearCurrentTimer();
    setState("cancelled");
    setBreathPhase("idle");
    setCountdown(0);
  }, [clearCurrentTimer]);

  const reset = useCallback(() => {
    clearCurrentTimer();
    setState("intro");
    setCurrentRep(0);
    setBreathPhase("idle");
    setCountdown(0);
  }, [clearCurrentTimer]);

  return {
    state,
    currentRep,
    breathPhase,
    countdown,
    start,
    cancel,
    reset,
  };
}
