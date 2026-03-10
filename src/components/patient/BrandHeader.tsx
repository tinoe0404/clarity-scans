import { cn } from "@/lib/utils";

export default function BrandHeader() {
  return (
    <div className="flex flex-col items-center justify-center pt-12 pb-8">
      <div 
        className={cn(
          "flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-500 shadow-glow mb-6",
          "animate-fadeIn opacity-0"
        )}
        style={{ animationDelay: "100ms" }}
      >
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2v20" />
          <path d="M2 12h20" />
        </svg>
      </div>

      <h1 
        className={cn(
          "font-display text-3xl font-extrabold tracking-tight",
          "bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent transform translate-y-4 opacity-0",
          "animate-slideUp"
        )}
        style={{ animationDelay: "300ms" }}
      >
        ClarityScans
      </h1>
      
      <p 
        className={cn(
          "mt-1 font-mono text-sm text-slate-500 opacity-0",
          "animate-fadeIn"
        )}
        style={{ animationDelay: "500ms" }}
      >
        Understand your CT Scan
      </p>

      <p 
        className={cn(
          "mt-4 font-mono text-[10px] uppercase tracking-widest text-slate-700 opacity-0",
          "animate-fadeIn"
        )}
        style={{ animationDelay: "700ms" }}
      >
        Harare Institute of Technology · HIT 300
      </p>
    </div>
  );
}
