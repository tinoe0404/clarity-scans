export default function FeedbackLoading() {
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

      <div className="flex-1 w-full flex flex-col pt-8 pb-10">
        
        {/* Progress Dots Skeleton */}
        <div className="flex justify-center mb-10 px-4">
           <div className="flex gap-2">
             {[1,2,3,4].map(i => (
               <div key={i} className="w-2.5 h-2.5 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
             ))}
           </div>
        </div>

        {/* Question Card Wrapper Skeleton */}
        <div className="flex-1 w-full flex flex-col items-center relative px-4 mx-auto max-w-sm">
           
           <div className="w-[80%] h-10 bg-white/10 rounded-xl mb-12 animate-pulse" />
           
           <div className="flex gap-3 w-full animate-pulse" style={{ animationDelay: '200ms' }}>
             {/* Simulating 2 generic hit targets natively fitting Yes/No sizes */}
             <div className="flex-1 h-20 rounded-xl border border-white/5 bg-white/5" />
             <div className="flex-1 h-20 rounded-xl border border-white/5 bg-white/5" />
           </div>

        </div>

      </div>
    
    </div>
  );
}
