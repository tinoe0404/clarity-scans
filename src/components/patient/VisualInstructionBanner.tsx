import { useState, useEffect } from "react";
import { Info, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface VisualInstructionBannerProps {
  // Locale passed down but not currently needed directly by banner natively
}

export default function VisualInstructionBanner({}: VisualInstructionBannerProps) {
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
    <div className="relative mx-6 mb-4 flex animate-fadeIn gap-3 rounded-xl border border-brand-500/15 bg-brand-500/5 px-4 py-3">
      <div className="mt-0.5 shrink-0">
        <Info className="h-5 w-5 text-brand-400" />
      </div>

      <div className="flex-1 pr-6">
        <p className="mb-0.5 text-sm font-medium leading-snug text-slate-300">{t("subtitle")}</p>
        <p className="text-xs leading-snug text-slate-500">{t("tapToShow")}</p>
      </div>

      <button
        onClick={handleDismiss}
        aria-label="Dismiss message"
        className="absolute right-2 top-2 rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-300"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
