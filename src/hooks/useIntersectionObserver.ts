"use client";

import { useEffect, useState, useRef } from "react";

interface IntersectionObserverArgs extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = "0%",
  freezeOnceVisible = false,
}: IntersectionObserverArgs = {}): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      setIntersecting(true);
      return;
    }

    let observer: IntersectionObserver | null = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry?.isIntersecting;
        if (freezeOnceVisible && isElementIntersecting) {
          setIntersecting(true);
          observer?.disconnect();
          observer = null;
        } else {
          setIntersecting(isElementIntersecting);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);
    return () => {
      observer?.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible]);

  return [ref, isIntersecting];
}
