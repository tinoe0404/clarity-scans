"use client";

import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import type { ReactNode } from "react";

interface LazyWrapperProps {
  children: ReactNode;
  fallback: ReactNode;
  isAboveFold?: boolean;
  rootMargin?: string;
  minHeight?: string;
}

export function LazyWrapper({
  children,
  fallback,
  isAboveFold = false,
  rootMargin = "200px",
  minHeight = "100px",
}: LazyWrapperProps) {
  const [ref, isIntersecting] = useIntersectionObserver({
    freezeOnceVisible: true,
    rootMargin,
  });

  if (isAboveFold) {
    return <>{children}</>;
  }

  return (
    <div ref={ref} style={{ minHeight }} className="w-full flex-shrink-0">
      {isIntersecting ? children : fallback}
    </div>
  );
}
