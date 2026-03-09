"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

interface ToastProps {
  message: string;
  variant: "success" | "error" | "info";
  visible: boolean;
  onDismiss: () => void;
}

const VARIANT_CONFIG = {
  success: {
    border: "border-l-medical-green",
    icon: CheckCircle,
    iconColor: "text-medical-green",
    role: "alert" as const,
  },
  error: {
    border: "border-l-medical-red",
    icon: AlertTriangle,
    iconColor: "text-medical-red",
    role: "alert" as const,
  },
  info: {
    border: "border-l-brand-400",
    icon: Info,
    iconColor: "text-brand-400",
    role: "status" as const,
  },
} as const;

export default function Toast({ message, variant, visible, onDismiss }: ToastProps) {
  const config = VARIANT_CONFIG[variant];
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2",
        "w-[calc(100%-48px)] max-w-[400px]",
        "rounded-xl border border-l-4 border-surface-border bg-surface-elevated shadow-xl",
        "flex items-center gap-3 px-4 py-3",
        "transition-all duration-300 ease-out",
        config.border,
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      )}
      role={config.role}
    >
      <IconComponent className={cn("h-5 w-5 shrink-0", config.iconColor)} />
      <p className="flex-1 text-sm text-white">{message}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
