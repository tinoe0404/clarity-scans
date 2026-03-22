"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

interface TabDef {
  key: string;
  emoji: string;
  label: string;
  path: string;
}

export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  const tabs: TabDef[] = [
    { key: "modules", emoji: "📋", label: "Videos", path: `/${locale}/modules` },
    { key: "breathhold", emoji: "🫁", label: "Breathe", path: `/${locale}/breathhold` },
    { key: "visual-guide", emoji: "🤟", label: "Signals", path: `/${locale}/visual-guide` },
    { key: "scanner-sound", emoji: "🔊", label: "Sound", path: `/${locale}/scanner-sound` },
    { key: "contrast-guide", emoji: "💧", label: "Contrast", path: `/${locale}/contrast-guide` },
    { key: "feedback", emoji: "📝", label: "Feedback", path: `/${locale}/feedback` },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 w-full border-t border-white/[0.04] bg-surface-card/90 pb-6 pt-2 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex h-full max-w-lg items-center justify-around px-4">
        {tabs.map((tab) => {
          const isActive = pathname.includes(tab.path);
          return (
            <Link
              key={tab.key}
              href={tab.path}
              className={cn(
                "group flex flex-1 flex-col items-center justify-center gap-1 transition-all duration-200",
                isActive ? "scale-110 text-brand-400" : "text-slate-500 hover:text-slate-300"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-200",
                isActive ? "bg-brand-500/15" : "group-hover:bg-white/5"
              )}>
                <span aria-hidden="true" className="text-lg">
                  {tab.emoji}
                </span>
              </div>
              <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
