"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { MessageSquare, ArrowRight, ThumbsUp, ThumbsDown } from "lucide-react";
import { LanguageBadge, SkeletonBlock } from "@/components/shared";
import { adminFetch } from "@/lib/adminFetch";
import { handleClientError } from "@/lib/globalErrorHandler";

// Approximate type based on typical feedback response
interface FeedbackItem {
  id: string;
  createdAt: string;
  languageUsed: "en" | "sn" | "nd";
  anxietyBefore: number | null;
  anxietyAfter: number | null;
  appHelpful: boolean | null;
  comments: string | null;
}

export default function RecentFeedbackList() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const res = await adminFetch("/api/feedback?pageSize=5&page=1");
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const json = await res.json();
        if (json.success && json.data?.items) {
          setFeedback(json.data.items);
        } else {
          setError(true);
        }
      } catch (err) {
        handleClientError(err, "RecentFeedbackList - fetchFeedback");
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeedback();
  }, []);

  const getAnxietyColor = (score: number | null) => {
    if (score === null) return "bg-surface-border text-slate-400";
    if (score <= 2) return "bg-medical-green/20 text-medical-green border border-medical-green/30";
    if (score === 3) return "bg-amber-500/20 text-amber-500 border border-amber-500/30";
    return "bg-red-500/20 text-red-400 border border-red-500/30";
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-elevated overflow-hidden flex flex-col h-full">
      <div className="border-b border-surface-border p-5 flex justify-between items-center bg-surface-elevated/50">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-brand-400" />
          Recent Feedback
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="divide-y divide-surface-border">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <SkeletonBlock className="h-4 w-24 bg-white/5" />
                  <SkeletonBlock className="h-5 w-16 bg-white/5 rounded-full" />
                </div>
                <div className="flex items-center gap-4">
                  <SkeletonBlock className="h-6 w-20 bg-white/5 rounded-full" />
                  <SkeletonBlock className="h-6 w-20 bg-white/5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-slate-400">
            <p className="text-sm">Failed to load recent feedback.</p>
          </div>
        ) : feedback.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-full">
            <MessageSquare className="h-8 w-8 mb-3 opacity-20" />
            <p className="text-sm">No feedback yet.</p>
            <p className="text-xs mt-1">Patient feedback will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {feedback.map((item) => {
              // Convert to Harare timezone
              const date = new Date(item.createdAt);
              const harareDate = toZonedTime(date, "Africa/Harare");
              
              return (
                <div key={item.id} className="p-4 hover:bg-surface-base/30 transition-colors group">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {format(harareDate, "MMM d, HH:mm")}
                    </span>
                    <LanguageBadge locale={item.languageUsed} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">Anxiety:</span>
                      <div className="flex items-center gap-1.5 bg-surface-base rounded-full px-2 py-1 border border-surface-border">
                        <span className={`flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold ${getAnxietyColor(item.anxietyBefore)}`}>
                          {item.anxietyBefore || "-"}
                        </span>
                        <ArrowRight className="h-3 w-3 text-slate-600" />
                        <span className={`flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold ${getAnxietyColor(item.anxietyAfter)}`}>
                          {item.anxietyAfter || "-"}
                        </span>
                      </div>
                    </div>
                    
                    {item.appHelpful !== null && (
                      <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${item.appHelpful ? 'bg-medical-green/10 text-medical-green' : 'bg-red-500/10 text-red-500'}`}>
                        {item.appHelpful ? <ThumbsUp className="h-3 w-3" /> : <ThumbsDown className="h-3 w-3" />}
                        <span className="font-medium">{item.appHelpful ? "Helpful" : "Not Helpful"}</span>
                      </div>
                    )}
                  </div>
                  
                  {item.comments && (
                    <div className="mt-3 text-xs text-slate-300 italic border-l-2 border-surface-border pl-3 line-clamp-2">
                      &quot;{item.comments}&quot;
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-surface-border p-3 bg-surface-base/50 mt-auto">
        <Link 
          href="/admin/analytics" 
          className="flex items-center justify-center w-full py-2 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors rounded-lg hover:bg-brand-500/10"
        >
          View All Feedback
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Link>
      </div>
    </div>
  );
}
