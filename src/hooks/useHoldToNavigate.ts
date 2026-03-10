"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UseHoldToNavigateReturn {
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: () => void;
    onPointerLeave: () => void;
    // Fallbacks for older devices
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
  progress: number;
  isHolding: boolean;
}

export function useHoldToNavigate(href: string, holdMs: number = 3000): UseHoldToNavigateReturn {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isNavigatingRef = useRef(false);

  const startHold = useCallback(
    (e?: React.PointerEvent | React.TouchEvent) => {
      // Only process primary pointer/touch (prevent multi-touch mess)
      if (e && "isPrimary" in e && !e.isPrimary) return;
      if (isNavigatingRef.current) return;

      setIsHolding(true);
      startTimeRef.current = performance.now();

      const animate = (time: number) => {
        if (!startTimeRef.current) return;

        const elapsed = time - startTimeRef.current;
        const currentProgress = Math.min((elapsed / holdMs) * 100, 100);

        setProgress(currentProgress);

        if (currentProgress >= 100) {
          setIsHolding(false);
          isNavigatingRef.current = true;
          router.push(href);
          return;
        }

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [holdMs, href, router]
  );

  const stopHold = useCallback(() => {
    if (isNavigatingRef.current) return;
    
    setIsHolding(false);
    setProgress(0);
    startTimeRef.current = null;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    handlers: {
      onPointerDown: startHold,
      onPointerUp: stopHold,
      onPointerLeave: stopHold,
      onTouchStart: startHold,
      onTouchEnd: stopHold,
    },
    progress,
    isHolding,
  };
}
