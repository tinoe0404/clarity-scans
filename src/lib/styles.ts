import { cn } from "./utils";

export function cardStyles(
  variant: "default" | "important" | "watched" | "elevated" = "default"
): string {
  const base = "rounded-2xl transition-all duration-fast overflow-hidden";

  switch (variant) {
    case "important":
      return cn(base, "bg-surface-elevated border-2 border-brand-500 shadow-glow-sm");
    case "watched":
      return cn(base, "bg-surface-card border border-medical-green/40 opacity-80");
    case "elevated":
      return cn(base, "bg-surface-elevated border border-surface-border shadow-md");
    case "default":
    default:
      return cn(base, "bg-surface-card border border-surface-border");
  }
}

export function buttonStyles(
  variant: "primary" | "secondary" | "ghost" | "danger" = "primary",
  size: "sm" | "md" | "lg" = "md"
): string {
  const base =
    "inline-flex items-center justify-center font-display font-semibold transition-colors duration-fast active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  const sizes = {
    sm: "h-10 px-4 text-sm rounded-lg",
    md: "h-14 px-6 text-base rounded-xl",
    lg: "h-16 px-8 text-lg rounded-2xl w-full",
  };

  const variants = {
    primary: "bg-brand-500 text-white hover:bg-brand-400 active:bg-brand-600 shadow-glow-sm",
    secondary:
      "bg-surface-elevated text-gray-100 border border-surface-border hover:bg-surface-border active:bg-surface-base",
    ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-surface-border",
    danger:
      "bg-medical-red/10 text-medical-red border border-medical-red/20 hover:bg-medical-red/20 active:bg-medical-red/30",
  };

  return cn(base, sizes[size], variants[variant]);
}

export function badgeStyles(variant: "important" | "watched" | "duration" | "language"): string {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider";

  switch (variant) {
    case "important":
      return cn(base, "bg-brand-500/10 text-brand-400 border border-brand-500/20");
    case "watched":
      return cn(base, "bg-medical-green/10 text-medical-green border border-medical-green/20");
    case "duration":
      return cn(base, "bg-surface-elevated text-gray-300 border border-surface-border font-mono");
    case "language":
      return cn(base, "bg-brand-900 text-brand-100 border border-brand-700");
    default:
      return base;
  }
}

export function inputStyles(state: "default" | "error" | "disabled" = "default"): string {
  const base =
    "w-full h-14 bg-surface-elevated border rounded-xl px-4 text-white font-display text-base transition-colors duration-fast placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-brand-500/50";

  switch (state) {
    case "error":
      return cn(base, "border-medical-red bg-medical-red/5 text-medical-red field-error");
    case "disabled":
      return cn(base, "border-surface-border opacity-50 cursor-not-allowed");
    case "default":
    default:
      return cn(base, "border-surface-border hover:border-brand-500/30");
  }
}

export function screenContainerStyles(): string {
  return "min-h-screen flex flex-col p-6 pb-12 w-full pt-6";
}

export function headerStyles(): string {
  return "mb-8 space-y-2";
}
