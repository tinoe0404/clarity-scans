import { BRAND_HUES } from "@/lib/constants";

export default function VisualGuideLoading() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-base">
      
      {/* Header Skeleton */}
      <div className="h-16 border-b border-white/5 bg-surface-elevated flex items-center px-4 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-white/5 mr-4" />
        <div className="flex flex-col gap-2">
           <div className="w-32 h-4 bg-white/10 rounded-full" />
           <div className="w-48 h-3 bg-white/5 rounded-full" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full px-6 pt-6 pb-24">
        
        {/* Banner Skeleton */}
        <div className="h-[68px] w-full rounded-xl bg-white/5 animate-pulse mb-6" />

        {/* 2-Column Grid Skeleton Cascade */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="h-[120px] rounded-3xl bg-white/5 animate-pulse border-2 border-white/5"
              style={{ animationDelay: `${i * 100}ms` }} 
            />
          ))}
        </div>

      </div>
    </div>
  );
}
