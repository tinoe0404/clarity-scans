import { cn } from "@/lib/utils";
import type { Locale } from "@/types";
import { OfflineBanner } from "@/components/shared/OfflineBanner";

interface AppShellProps {
  children: React.ReactNode;
  locale: Locale;
  className?: string;
}

export default function AppShell({ children, locale: _locale, className }: AppShellProps) {
  return (
    <div
      className={cn(
        "relative mx-auto flex min-h-screen max-w-[480px] flex-col overflow-x-hidden bg-surface-card",
        className
      )}
    >
      <OfflineBanner />
      {children}
    </div>
  );
}
