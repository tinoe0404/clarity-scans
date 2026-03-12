"use client";

import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScreenTransitionProps {
  children: ReactNode;
  variant?: "fade" | "slideUp" | "slideLeft";
  transitionKey?: string;
  className?: string;
}

export default function ScreenTransition({
  children,
  variant = "fade",
  transitionKey,
  className,
}: ScreenTransitionProps) {
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Re-trigger animation when transitionKey changes
  useEffect(() => {
    if (transitionKey === undefined) return;
    setMounted(false);
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, [transitionKey]);

  if (!mounted) {
    return <div className={cn("flex flex-1 flex-col opacity-0", className)}>{children}</div>;
  }

  if (prefersReducedMotion) {
    return <div className={cn("flex flex-1 flex-col opacity-100", className)}>{children}</div>;
  }

  const animations = {
    fade: "animate-fadeIn",
    slideUp: "animate-slideUp",
    slideLeft: "animate-fadeIn", // We don't have slideLeft in config, fallback to fadeIn
  };

  return (
    <div className={cn(animations[variant], "flex flex-1 flex-col motion-reduce:animate-none motion-reduce:transition-none", className)}>{children}</div>
  );
}
