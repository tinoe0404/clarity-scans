"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface ToastState {
  message: string;
  variant: "success" | "error" | "info";
  visible: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    variant: "info",
    visible: false,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const showToast = useCallback(
    (message: string, variant: "success" | "error" | "info" = "info", duration: number = 3000) => {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToast({ message, variant, visible: true });

      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [hideToast]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { toast, showToast, hideToast };
}
