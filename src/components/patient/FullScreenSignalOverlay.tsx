import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { SignalDefinition } from "@/lib/signalRegistry";
import { useSwipeDown } from "@/hooks/useSwipeDown";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface FullScreenSignalOverlayProps {
  signal: SignalDefinition;
  label: string;
  onClose: () => void;
}

export default function FullScreenSignalOverlay({
  signal,
  label,
  onClose,
}: FullScreenSignalOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();

  // 1. Gesture binding
  useSwipeDown(overlayRef, {
    onSwipeDown: onClose,
    threshold: 80,
  });

  // 2. Keyboard + Focus Trap mappings
  useEffect(() => {
    // Lock body scrolling immediately when overlay mounts globally
    document.body.style.overflow = "hidden";

    // Focus shifting to trap internally mapping specifically for pure Screen reader environments
    if (closeBtnRef.current) {
      closeBtnRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center overscroll-none",
        !reducedMotion ? "animate-zoomIn fade-in-0 duration-200" : ""
      )}
      style={{
        backgroundColor: signal.backgroundColor,
        // The literal 3-meter physical vignette tracking edge
        boxShadow: `inset 0 0 0 12px ${signal.color}`,
      }}
    >
      
      <button
        ref={closeBtnRef}
        onClick={onClose}
        aria-label="Close full screen signal"
        className="absolute top-6 right-6 p-4 rounded-full transition-colors hover:bg-white/10 active:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent outline-none"
        style={{ color: signal.textColor, opacity: 0.6 }} // Meets contrast scaling natively
      >
        <X className="h-10 w-10" />
      </button>

      {/* Extreme literal physical 3-meter layout scale demands */}
      <div className="flex flex-col items-center justify-center px-8 w-full select-none">
         <span 
           className="text-[140px] leading-none mb-8 drop-shadow-2xl translate-y-2 pointer-events-none" 
           aria-hidden="true"
           style={{ filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.3))" }}
         >
           {signal.emoji}
         </span>
         
         <h1 
           className="font-display font-bold text-[48px] md:text-[64px] text-center leading-[1.1] max-w-[90%] tracking-tight pointer-events-none break-words"
           style={{ color: signal.textColor }}
         >
           {label}
         </h1>
      </div>

      <div className="absolute bottom-8 text-center px-4 w-full pointer-events-none">
        <p className="font-mono text-xs font-medium uppercase tracking-widest opacity-40 mix-blend-overlay" style={{ color: signal.textColor }}>
          ClarityScans 
        </p>
      </div>
      
    </div>
  );
}
