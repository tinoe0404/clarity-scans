import React from "react";
import Link from "next/link";
import type { Route } from "next";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";

interface BreathTrainerCTAProps {
  locale: Locale;
}

export default function BreathTrainerCTA({ locale }: BreathTrainerCTAProps) {
  return (
    <div className="mt-8 mb-4 px-6">
      <Link
        href={`/${locale}/breathhold` as Route}
        className={cn(
          buttonStyles("primary", "lg"),
          "w-full bg-[#f97316] text-white hover:bg-orange-400 border-none relative overflow-hidden group shadow-[0_0_20px_rgba(249,115,22,0.3)] animate-pulse-glow"
        )}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <span className="text-xl">🫁</span>
          Now practise the breath-hold →
        </span>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      </Link>
    </div>
  );
}
