import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

export default function AppShell({ children, className }: AppShellProps) {
  return (
    <div
      className={cn(
        "relative mx-auto flex min-h-screen max-w-[480px] flex-col overflow-x-hidden bg-surface-card",
        className
      )}
    >
      {children}
    </div>
  );
}
