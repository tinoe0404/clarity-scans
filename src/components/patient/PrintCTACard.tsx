import { useState, useEffect } from "react";
import { Maximize, Smartphone } from "lucide-react";

import { buttonStyles } from "@/lib/styles";
import { cn } from "@/lib/utils";

interface PrintCTACardProps {
  // Locale explicit props excluded
}

export default function PrintCTACard({}: PrintCTACardProps) {
  const [isMobile, setIsMobile] = useState(true); // Default safe assumption SSR

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Basic check determining if native window.print() makes logical sense locally vs just asking patient to physically hit phone buttons
      setIsMobile(window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent));
    }
  }, []);

  const handlePrint = () => {
    if (!isMobile && typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div
      className="mx-6 mb-8 animate-fadeIn rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 text-center"
      style={{ animationDelay: "400ms", animationFillMode: "both" }}
    >
      <div className="mb-3 flex justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10">
          {isMobile ? (
            <Smartphone className="h-5 w-5 text-brand-400" />
          ) : (
            <Maximize className="h-5 w-5 text-brand-400" />
          )}
        </div>
      </div>

      <h3 className="mb-1 font-bold text-white">Take this with you into the scan room</h3>
      <p className="mb-4 px-2 text-xs text-slate-400">
        Screenshot this screen or ask the radiographer to print a copy
      </p>

      {isMobile ? (
        <div className="inline-flex rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5">
          <span className="text-xs font-medium text-slate-300">📱 Take a screenshot</span>
        </div>
      ) : (
        <button
          onClick={handlePrint}
          className={cn(buttonStyles("secondary", "md"), "w-full max-w-[200px]")}
        >
          Screenshot guide
        </button>
      )}
    </div>
  );
}
