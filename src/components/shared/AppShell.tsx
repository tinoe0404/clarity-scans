import { cn } from "@/lib/utils";
import type { Locale } from "@/types";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { GlobalHeader } from "./GlobalHeader";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  locale: Locale;
  className?: string;
  showNav?: boolean;
  showBottomNav?: boolean;
}

export default function AppShell({
  children,
  locale,
  className,
  showNav = true,
  showBottomNav = true,
}: AppShellProps) {
  // English fallback for skip link if locale is missing
  const skipText =
    locale === "sn"
      ? "Svetuka kuenda pane zvirimo"
      : locale === "nd"
        ? "Yeqa kokuqukethwe kakhulu"
        : "Skip to main content";

  return (
    <div
      className={cn(
        "relative mx-auto flex min-h-screen w-full md:max-w-2xl lg:max-w-4xl xl:max-w-5xl flex-col overflow-x-hidden bg-surface-card shadow-2xl transition-all duration-300",
        className
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:z-50 focus:rounded-full focus:bg-brand-500 focus:px-6 focus:py-3 focus:text-white focus:font-bold focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-surface-card"
      >
        {skipText}
      </a>
      
      {showNav && <GlobalHeader locale={locale} />}
      <OfflineBanner />
      
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {showBottomNav && <BottomNav locale={locale} />}
    </div>
  );
}
