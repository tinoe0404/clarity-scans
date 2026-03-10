import { useState, useEffect } from "react";
import { Info, X } from "lucide-react";
import type { Locale } from "@/types";
import { useTranslations } from "next-intl";

interface VisualInstructionBannerProps {
  locale: Locale;
}

export default function VisualInstructionBanner({ locale }: VisualInstructionBannerProps) {
  const t = useTranslations("visual");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Session bounding prevents annoying repeats
    const dismissed = sessionStorage.getItem("cs_visual_banner_dismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("cs_visual_banner_dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-brand-500/5 border border-brand-500/15 rounded-xl px-4 py-3 mx-6 mb-4 relative animate-fadeIn flex gap-3">
      <div className="shrink-0 mt-0.5">
        <Info className="h-5 w-5 text-brand-400" />
      </div>
      
      <div className="flex-1 pr-6">
        <p className="text-sm font-medium text-slate-300 mb-0.5 leading-snug">
          {t("subtitle")}
        </p>
        <p className="text-xs text-slate-500 leading-snug">
          {t("tapToShow")}
        </p>
      </div>
      
      <button 
        onClick={handleDismiss}
        aria-label="Dismiss message"
        className="absolute top-2 right-2 p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
