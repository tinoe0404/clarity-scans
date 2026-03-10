"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";
import type { Locale } from "@/types";
import { useTranslations } from "next-intl";

interface AllDoneCardProps {
  locale: Locale;
}

export default function AllDoneCard({ locale }: AllDoneCardProps) {
  const t = useTranslations("modules");

  return (
    <div 
      role="status" 
      aria-live="polite"
      className="mx-6 mb-6 rounded-3xl border border-medical-green/30 bg-medical-green/5 p-6 text-center animate-slideUp overflow-hidden relative shadow-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-medical-green/10 to-transparent opacity-50 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="mb-4 text-[64px] leading-none animate-fadeIn" style={{ animationDelay: "200ms" }}>
          ✅
        </div>
        
        <h2 className="font-display text-2xl font-bold text-white mb-2">
          {t("allDone")}
        </h2>
        
        <p className="text-sm text-slate-300 mb-6">
          {t("allDoneSubtitle")}
        </p>
        
        <Link 
          href={`/${locale}/feedback` as Route}
          className={cn(buttonStyles("primary", "md"), "w-full bg-medical-green text-green-950 hover:bg-green-400 hover:text-green-950 border-none shadow-glow")}
        >
          Give Feedback
        </Link>
      </div>
    </div>
  );
}
