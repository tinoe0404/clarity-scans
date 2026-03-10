import { Volume2, VolumeX, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioToggleProps {
  isAvailable: boolean;
  isEnabled: boolean;
  onToggle: () => void;
}

export default function AudioToggle({ isAvailable, isEnabled, onToggle }: AudioToggleProps) {
  if (!isAvailable) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
        <AlertTriangle className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">Audio unavailable on this device</span>
      </div>
    );
  }

  return (
    <button
      onClick={onToggle}
      aria-pressed={isEnabled}
      aria-label="Toggle audio commands"
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
        isEnabled
          ? "bg-brand-500/15 border-brand-500/30 text-brand-400 hover:bg-brand-500/25"
          : "bg-white/[0.04] border-white/[0.08] text-slate-500 hover:text-slate-300 hover:bg-white/[0.08]"
      )}
    >
      {isEnabled ? (
        <>
          <Volume2 className="h-4 w-4" aria-hidden="true" />
          <span>Audio On</span>
        </>
      ) : (
        <>
          <VolumeX className="h-4 w-4" aria-hidden="true" />
          <span>Audio Off</span>
        </>
      )}
    </button>
  );
}
