import { Database, HardDrive, Activity, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StorageStats } from "@/types";

interface SystemStatusCardProps {
  db: {
    healthy: boolean;
    latencyMs: number;
    error?: string;
  } | null;
  blob: (StorageStats & { error?: string }) | null;
}

export default function SystemStatusCard({ db, blob }: SystemStatusCardProps) {
  // DB Status logic
  const dbHealthy = db?.healthy ?? false;
  const dbLatency = db?.latencyMs ?? 0;
  const dbLatencyColor = dbLatency > 500 ? "text-amber-500" : "text-medical-green";
  const dbStatusColor = !dbHealthy 
    ? "bg-red-500" 
    : dbLatency > 500 ? "bg-amber-500" : "bg-medical-green";

  // Blob Status logic
  const blobHealthy = blob && !blob.error;
  const blobStatusColor = blobHealthy ? "bg-medical-green" : "bg-red-500";
  
  // Storage Usage logic
  const usedMB = blob?.totalMB ?? 0;
  const limitGB = blob?.freetierLimitGB ?? 1;
  const limitMB = limitGB * 1024;
  const percentUsed = blobHealthy ? Math.min((usedMB / limitMB) * 100, 100) : 0;
  
  let progressColor = "bg-medical-green";
  if (percentUsed >= 80) progressColor = "bg-red-500";
  else if (percentUsed >= 60) progressColor = "bg-amber-500";

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-elevated overflow-hidden">
      <div className="border-b border-surface-border p-5">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Activity className="h-4 w-4 text-brand-400" />
          System Health
        </h3>
      </div>
      
      <div className="p-5 space-y-6">
        {/* Status Indicators Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* App Status (Always green if rendering) */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-base border border-surface-border">
            <Server className="h-5 w-5 text-slate-400 mb-2" />
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medical-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-medical-green"></span>
              </span>
              <span className="text-xs font-medium text-slate-300">App</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Online</span>
          </div>

          {/* Database Status */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-base border border-surface-border">
            <Database className="h-5 w-5 text-slate-400 mb-2" />
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", dbStatusColor)} />
              <span className="text-xs font-medium text-slate-300">Database</span>
            </div>
            <span className="text-[10px] mt-1 flex items-center justify-center gap-1">
              {db ? (
                <>
                  <span className={dbLatencyColor}>{dbLatency}ms</span>
                  <span className="text-slate-500">latency</span>
                </>
              ) : (
                <span className="text-slate-500">Unknown</span>
              )}
            </span>
          </div>

          {/* Blob Storage Status */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-base border border-surface-border">
            <HardDrive className="h-5 w-5 text-slate-400 mb-2" />
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", blobStatusColor)} />
              <span className="text-xs font-medium text-slate-300">Storage</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 line-clamp-1 break-all" title={blob?.error}>
              {blobHealthy ? "Connected" : "Error"}
            </span>
          </div>
        </div>

        {/* Storage Usage Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-medium">Blob Storage Usage</span>
            <span className="text-slate-300">
              <span className="font-semibold text-white">{usedMB.toFixed(1)} MB</span> / {limitGB} GB
            </span>
          </div>
          <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-1000", progressColor)} 
              style={{ width: `${Math.max(percentUsed, 1)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>{percentUsed.toFixed(1)}% Used</span>
            {blobHealthy && (
              <span>{blob.videoCount} videos, {blob.thumbnailCount} thumbs</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
