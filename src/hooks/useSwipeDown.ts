import { useEffect, useRef } from "react";

interface UseSwipeDownOptions {
  onSwipeDown: () => void;
  threshold?: number; 
  enabled?: boolean;
}

export function useSwipeDown(
  ref: React.RefObject<HTMLElement | null>,
  { onSwipeDown, threshold = 80, enabled = true }: UseSwipeDownOptions
): void {
  const startYRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      startYRef.current = e.touches[0]?.clientY ?? null;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (startYRef.current === null) return;

      const endY = e.changedTouches[0]?.clientY;
      const deltaY = endY - startYRef.current;

      if (deltaY > threshold) {
        onSwipeDown();
      }

      startYRef.current = null;
    };

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [ref, onSwipeDown, threshold, enabled]);
}
