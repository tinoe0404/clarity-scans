"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, List, Calendar as CalendarIcon } from "lucide-react";
import NewNoteForm from "./NewNoteForm";
import RecentNotesList from "./RecentNotesList";
import NotesSummaryPanel from "./NotesSummaryPanel";
import NotesCalendar from "./NotesCalendar";
import { RadioNoteRecord } from "@/types";
import { DateRangeOption } from "./DateRangeSelector";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/lib/adminFetch";
import { handleClientError } from "@/lib/globalErrorHandler";

interface NotesScreenProps {
  initialNotes: RadioNoteRecord[];
  initialSummary: any;
  initialTotal: number;
}

export default function NotesScreen({
  initialNotes,
  initialSummary,
  initialTotal,
}: NotesScreenProps) {
  const [notes, setNotes] = useState<RadioNoteRecord[]>(initialNotes);
  const [summary, setSummary] = useState(initialSummary);
  const [dateRange, setDateRange] = useState<DateRangeOption>("week");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialNotes.length < initialTotal);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);

  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);

  useEffect(() => {
    const savedView = localStorage.getItem("cs_notes_view");
    if (savedView === "list" || savedView === "calendar") {
      setViewMode(savedView);
    }
  }, []);

  useEffect(() => {
    if (viewMode === "calendar" && calendarData.length === 0) {
      fetchCalendarData();
    }
  }, [viewMode]);

  const fetchCalendarData = async () => {
    setIsLoadingCalendar(true);
    try {
      const res = await adminFetch("/api/admin/notes?format=calendar&dateRange=all");
      const data = await res.json();
      if (data.success) {
        setCalendarData(data.data);
      }
    } catch (error) {
      handleClientError(error, "NotesScreen - fetchCalendarData");
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const loadMoreNotes = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await adminFetch(`/api/admin/notes?page=${nextPage}&pageSize=10`);
      const data = await res.json();
      if (data.success) {
        setNotes((prev) => [...prev, ...data.data]);
        setPage(nextPage);
        setHasMore(data.pagination.page < data.pagination.totalPages);
      }
    } catch (error) {
      handleClientError(error, "NotesScreen - loadMoreNotes");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleDateRangeChange = async (range: DateRangeOption) => {
    setDateRange(range);
    setIsLoadingSummary(true);
    try {
      const res = await adminFetch(`/api/admin/notes?page=1&pageSize=1&summary=true&dateRange=${range}`);
      const data = await res.json();
      if (data.success && data.summary) {
        setSummary(data.summary);
      }
    } catch (error) {
      handleClientError(error, "NotesScreen - handleDateRangeChange");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleNoteAdded = (newNote: RadioNoteRecord) => {
    setNotes((prev) => [newNote, ...prev]);
    // Optionally trigger a summary refetch since total went up
    handleDateRangeChange(dateRange);
    if (viewMode === "calendar") fetchCalendarData();
    setIsMobileFormOpen(false); // Close mobile slide-up panel automatically after save
  };

  const handleNoteDeleted = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    handleDateRangeChange(dateRange);
    if (viewMode === "calendar") fetchCalendarData();
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Top Section - Summary panel (always full width) */}
      <NotesSummaryPanel 
        summary={summary} 
        isLoading={isLoadingSummary}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column - Form (Desktop visible, Mobile hidden by default) */}
        <div className={cn(
          "lg:w-[400px] xl:w-[450px] shrink-0",
          !isMobileFormOpen && "hidden lg:block", // Hide on mobile, show on desktop
          isMobileFormOpen && "fixed inset-0 z-50 bg-brand-950/80 backdrop-blur-sm lg:relative lg:inset-auto lg:bg-transparent lg:backdrop-blur-none p-4 lg:p-0 flex items-end lg:block overflow-hidden"
        )}>
          {/* Mobile backdrop close listener */}
          {isMobileFormOpen && (
            <div 
              className="absolute inset-0 z-0 lg:hidden" 
              onClick={() => setIsMobileFormOpen(false)}
            />
          )}
          
          <div className={cn(
            "w-full max-h-[90vh] overflow-y-auto relative z-10 lg:sticky lg:top-6 lg:max-h-[calc(100vh-140px)] shadow-2xl lg:shadow-none bg-surface-base lg:bg-transparent rounded-2xl",
            isMobileFormOpen && "animate-in slide-in-from-bottom-full duration-300"
          )}>
            {/* Close button for mobile form */}
            {isMobileFormOpen && (
              <div className="flex justify-end p-2 lg:hidden absolute top-0 right-0 z-20">
                <button 
                  onClick={() => setIsMobileFormOpen(false)}
                  className="p-1.5 rounded-full bg-surface-elevated border border-surface-border text-slate-300 shadow-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <NewNoteForm onNoteAdded={handleNoteAdded} />
          </div>
        </div>

        {/* Right Column - Lists and Calendar */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Recent Notes</h3>
            
            <div className="flex bg-surface-elevated rounded-lg p-1 border border-surface-border">
              <button
                onClick={() => { setViewMode("list"); localStorage.setItem("cs_notes_view", "list"); }}
                className={cn(
                  "p-2 text-sm font-medium rounded-md transition-all flex items-center gap-1.5",
                  viewMode === "list" ? "bg-brand-500/20 text-brand-400 border border-brand-500/30" : "text-slate-400 hover:text-white bg-transparent border border-transparent"
                )}
              >
                <List className="w-4 h-4" /> List
              </button>
              <button
                onClick={() => { setViewMode("calendar"); localStorage.setItem("cs_notes_view", "calendar"); }}
                className={cn(
                  "p-2 text-sm font-medium rounded-md transition-all flex items-center gap-1.5",
                  viewMode === "calendar" ? "bg-brand-500/20 text-brand-400 border border-brand-500/30" : "text-slate-400 hover:text-white bg-transparent border border-transparent"
                )}
              >
                <CalendarIcon className="w-4 h-4" /> Calendar
              </button>
            </div>
          </div>

          {viewMode === "list" ? (
            <RecentNotesList 
              notes={notes}
              onLoadMore={loadMoreNotes}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              onNoteDeleted={handleNoteDeleted}
            />
          ) : (
            <NotesCalendar 
              data={calendarData} 
              isLoading={isLoadingCalendar} 
            />
          )}

        </div>
      </div>

      {/* Mobile Floating Action Button */}
      {!isMobileFormOpen && (
        <button
          onClick={() => setIsMobileFormOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-brand-500 text-white px-5 py-4 rounded-full shadow-[0_0_20px_rgba(var(--brand-500-rgb),0.4)] flex items-center gap-2 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/50 hover:bg-brand-400 transition-all border border-brand-400/50"
        >
          <Plus className="w-5 h-5 mx-auto" />
          <span>New Note</span>
        </button>
      )}

    </div>
  );
}
