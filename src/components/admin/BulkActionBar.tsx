"use client";

import { Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";

interface BulkActionBarProps {
  selectedCount: number;
  isProcessing: boolean;
  progressText: string;
  onActivateAll: () => void;
  onDeactivateAll: () => void;
  onCancel: () => void;
}

export default function BulkActionBar({
  selectedCount,
  isProcessing,
  progressText,
  onActivateAll,
  onDeactivateAll,
  onCancel,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-24 left-0 right-0 z-40 mx-auto max-w-xl px-4 md:bottom-6">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-brand-500/20 bg-surface-elevated/95 px-5 py-4 shadow-2xl backdrop-blur-lg">
        {isProcessing ? (
          <div className="flex items-center gap-2 text-sm text-brand-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            {progressText}
          </div>
        ) : (
          <>
            <span className="text-sm font-medium text-white">{selectedCount} selected</span>
            <div className="flex items-center gap-2">
              <button
                onClick={onActivateAll}
                className={cn(
                  buttonStyles("primary", "sm"),
                  "flex items-center gap-1.5 bg-medical-green text-xs hover:bg-medical-green/80"
                )}
              >
                <ToggleRight className="h-3.5 w-3.5" />
                Activate
              </button>
              <button
                onClick={onDeactivateAll}
                className={cn(
                  buttonStyles("secondary", "sm"),
                  "flex items-center gap-1.5 text-xs text-medical-amber"
                )}
              >
                <ToggleLeft className="h-3.5 w-3.5" />
                Deactivate
              </button>
              <button
                onClick={onCancel}
                className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
