import { useState, useEffect, useCallback, useRef } from "react";

export function useAutoReset(delayMs: number, onReset: () => void) {
  const [remainingTime, setRemainingTime] = useState(Math.ceil(delayMs / 1000));
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimeRef = useRef<number>(Date.now() + delayMs);
  const delayRef = useRef(delayMs);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    finishTimeRef.current = Date.now() + delayRef.current;
    setRemainingTime(Math.ceil(delayRef.current / 1000));

    timerRef.current = setInterval(() => {
      const remaining = finishTimeRef.current - Date.now();
      
      if (remaining <= 0) {
        clearTimer();
        setRemainingTime(0);
        onReset();
      } else {
        setRemainingTime(Math.ceil(remaining / 1000));
      }
    }, 1000);
  }, [clearTimer, onReset]);

  // Handle manual interaction resets cleanly avoiding closure traps
  const resetTimer = useCallback(() => {
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    startTimer();
    return () => clearTimer();
  }, [startTimer, clearTimer]);

  return { remainingTime, resetTimer };
}
