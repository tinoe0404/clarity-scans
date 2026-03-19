

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn("font-display text-lg font-bold tracking-tight", className)}
      aria-label="ClarityScans"
    >
      Clarity<span className="text-brand-500">Scans</span>
    </span>
  );
}
