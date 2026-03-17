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
  const tabs: TabDef[] = [
    { key: "modules", emoji: "📋", label: "Videos", path: `/${locale}/modules` },
    { key: "breathhold", emoji: "🫁", label: "Breathe", path: `/${locale}/breathhold` },
    { key: "visual", emoji: "🤟", label: "Signals", path: `/${locale}/visual-guide` },
    { key: "scanner", emoji: "🔊", label: "Sound", path: `/${locale}/scanner-sound` },
    { key: "contrast", emoji: "💧", label: "Contrast", path: `/${locale}/contrast-guide` },
    { key: "feedback", emoji: "📝", label: "Feedback", path: `/${locale}/feedback` },
  ];

  return (
    <nav className="mx-6 mb-5 flex rounded-xl bg-white/[0.04] p-1 overflow-x-auto custom-scrollbar" role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <a
            key={tab.key}
            href={tab.path}
            role="tab"
            aria-current={isActive ? "page" : undefined}
            aria-selected={isActive}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-semibold transition-colors",
              isActive ? "bg-brand-500/15 text-brand-400" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <span aria-hidden="true" className="text-base">
              {tab.emoji}
            </span>
            <span>{tab.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
