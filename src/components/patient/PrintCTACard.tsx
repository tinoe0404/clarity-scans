import { useState, useEffect } from "react";
import { Maximize, Smartphone } from "lucide-react";
import type { Locale } from "@/types";
import { buttonStyles } from "@/lib/styles";
import { cn } from "@/lib/utils";

interface PrintCTACardProps {
  locale: Locale;
}

export default function PrintCTACard({ locale }: PrintCTACardProps) {
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
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 mx-6 mb-8 text-center animate-fadeIn" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
      
      <div className="flex justify-center mb-3">
         <div className="h-10 w-10 rounded-full bg-brand-500/10 flex items-center justify-center">
            {isMobile ? 
               <Smartphone className="h-5 w-5 text-brand-400" /> : 
               <Maximize className="h-5 w-5 text-brand-400" />
            }
         </div>
      </div>

      <h3 className="font-bold text-white mb-1">Take this with you into the scan room</h3>
      <p className="text-xs text-slate-400 mb-4 px-2">
        Screenshot this screen or ask the radiographer to print a copy
      </p>

      {isMobile ? (
        <div className="bg-white/[0.04] rounded-lg py-2.5 px-4 inline-flex border border-white/[0.08]">
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
