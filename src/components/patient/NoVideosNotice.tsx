import React from "react";
import { Info } from "lucide-react";

export default function NoVideosNotice() {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-brand-500/15 bg-brand-500/5 p-4 mx-6 mt-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
        <Info className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-slate-400 leading-relaxed">
          Videos are being prepared. Please ask the radiographer to explain the
          procedure while you wait.
        </p>
      </div>
    </div>
  );
}
