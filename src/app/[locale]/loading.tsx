export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-surface-base">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent shadow-glow" />
        <p className="font-mono text-sm text-slate-500 uppercase tracking-widest">Loading</p>
      </div>
    </div>
  );
}
