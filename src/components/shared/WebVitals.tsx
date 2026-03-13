"use client";

import { useReportWebVitals } from "next/web-vitals";
import { useAnalytics } from "@/hooks/useAnalytics";

export function WebVitals() {
  const { trackEvent } = useAnalytics();

  useReportWebVitals((metric) => {
    // We only care about Core Web Vitals historically
    if (metric.name === "CLS" || metric.name === "FID" || metric.name === "LCP" || metric.name === "INP" || metric.name === "FCP") {
      trackEvent("web_vital", {
        name: metric.name,
        value: metric.value,
        rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
        delta: metric.delta,
        id: metric.id,
      });
    }
  });

  return null;
}
