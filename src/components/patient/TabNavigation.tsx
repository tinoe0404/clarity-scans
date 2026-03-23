"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

interface TabNavigationProps {
  locale: Locale;
  activeTab: "modules" | "breathhold" | "visual" | "feedback" | "scanner" | "contrast";
}

interface TabDef {
  key: "modules" | "breathhold" | "visual" | "feedback" | "scanner" | "contrast";
  emoji: string;
  label: string;
  path: string;
}

export default function TabNavigation({ locale, activeTab }: TabNavigationProps) {
  const pathname = usePathname();

  const tabs: TabDef[] = [
    { key: "modules", emoji: "📋", label: "Videos", path: `/${locale}/modules` },
    { key: "breathhold", emoji: "🫁", label: "Breathe", path: `/${locale}/breathhold` },
    { key: "visual", emoji: "🤟", label: "Signals", path: `/${locale}/visual-guide` },
    { key: "scanner", emoji: "🔊", label: "Sound", path: `/${locale}/scanner-sound` },
    { key: "contrast", emoji: "💧", label: "Contrast", path: `/${locale}/contrast-guide` },
    { key: "feedback", emoji: "📝", label: "Feedback", path: `/${locale}/feedback` },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 mx-auto md:max-w-2xl lg:max-w-4xl xl:max-w-5xl"
      role="tablist"
      aria-label="Main navigation"
    >
      {/* Glassmorphism container */}
      <div className="border-t border-white/[0.08] bg-surface-card/80 backdrop-blur-xl backdrop-saturate-150 shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
        <div
          className="flex items-stretch"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab || pathname === tab.path;
            return (
              <Link
                key={tab.key}
                href={tab.path}
                role="tab"
                aria-current={isActive ? "page" : undefined}
                aria-selected={isActive}
                prefetch={true}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 pt-2.5 text-[10px] font-semibold transition-all duration-200",
                  "active:scale-90 active:transition-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-inset",
                  isActive
                    ? "text-brand-400"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                {/* Active indicator pill */}
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full bg-brand-400 animate-scaleIn"
                    aria-hidden="true"
                  />
                )}

                {/* Icon with subtle scale on active */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "text-lg transition-transform duration-300",
                    isActive && "scale-110"
                  )}
                >
                  {tab.emoji}
                </span>

                {/* Label */}
                <span className={cn(
                  "transition-colors duration-200",
                  isActive && "text-brand-300"
                )}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
