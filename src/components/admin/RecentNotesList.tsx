"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { format } from "date-fns";
import { 
  CheckCircle, 
  XCircle, 
  Minus, 
  AlertTriangle, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import { RadioNoteRecord } from "@/types";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";

interface RecentNotesListProps {
  notes: RadioNoteRecord[];
  onLoadMore: () => void;
  isLoadingMore: boolean;
  hasMore: boolean;
  onNoteDeleted: (id: string) => void;
}

const formatDateHarare = (dateStr: string | Date) => {
  try {
    return new Intl.DateTimeFormat("en-ZW", {
      timeZone: "Africa/Harare",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateStr));
  } catch (e) {
    return new Date(dateStr).toLocaleString();
  }
};

const NoteCard = ({ 
  note, 
  onNoteDeleted 
}: { 
  note: RadioNoteRecord; 
  onNoteDeleted: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  
  // Session Lookup inner state
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(false);

  const fetchSessionDetails = async () => {
    if (!note.session_id) return;
    setLoadingSession(true);
    try {
      const res = await fetch(`/api/admin/sessions/${note.session_id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSessionDetails(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch session details", e);
    } finally {
      setLoadingSession(false);
    }
  };

  const handleExpand = () => {
    if (!expanded && note.session_id && !sessionDetails) {
      fetchSessionDetails();
    }
    setExpanded(!expanded);
    if (expanded) setConfirmDelete(false); // Reset delete state on collapse
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/notes/${note.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setFadingOut(true);
        setTimeout(() => {
          onNoteDeleted(note.id);
        }, 300); // Wait for fade-out animation
      } else {
        throw new Error(data.error || "Failed to delete");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete note. Please try again.");
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const hasLongComments = note.comments && note.comments.length > 80;
  const truncatedComments = hasLongComments ? `${note.comments!.substring(0, 80)}...` : note.comments;

  return (
    <div 
      onClick={handleExpand}
      className={cn(
        "bg-surface-elevated rounded-xl border border-surface-border p-4 transition-all duration-300 cursor-pointer overflow-hidden group hover:border-surface-border/80",
        fadingOut && "opacity-0 scale-95 h-0 p-0 mb-0 border-0 m-0",
        expanded && "ring-1 ring-brand-500/20"
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">
            {formatDateHarare(note.created_at)}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-base border border-surface-border text-slate-300">
            {note.language_used}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-4 mb-3">
        <div className="flex items-center gap-3 bg-surface-base px-3 py-1.5 rounded-lg border border-surface-border/50">
          <div 
            className="flex items-center gap-1.5 text-xs font-medium" 
            title="Followed Breath-hold Instructions"
          >
            {note.followed_breathhold ? (
              <CheckCircle className="w-4 h-4 text-medical-green" />
            ) : (
              <XCircle className="w-4 h-4 text-medical-red" />
            )}
            <span className={note.followed_breathhold ? "text-slate-300" : "text-amber-100"}>
              Instructions
            </span>
          </div>

          <div className="w-px h-4 bg-surface-border" />

          <div 
            className="flex items-center gap-1.5 text-xs font-medium" 
            title="Repeat Scan Required"
          >
            {note.repeat_scan_required ? (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            ) : (
              <Minus className="w-4 h-4 text-medical-green font-bold" />
            )}
            <span className={note.repeat_scan_required ? "text-amber-100" : "text-slate-300"}>
              Repeat
            </span>
          </div>
        </div>
      </div>

      {!expanded && note.comments && (
        <div className="text-sm text-slate-400 italic">
          "{truncatedComments}"
          {hasLongComments && (
             <span className="text-brand-400 ml-1 text-xs not-italic hover:underline font-medium">Show more</span>
          )}
        </div>
      )}

      {expanded && (
        <div className="mt-4 pt-4 border-t border-surface-border/50 animate-in fade-in slide-in-from-top-2">
          {note.comments && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Comments</p>
              <p className="text-sm text-slate-300 bg-surface-base p-3 rounded-lg border border-surface-border whitespace-pre-wrap">
                {note.comments}
              </p>
            </div>
          )}

          <div className="mb-4">
            <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Session Link</p>
            {note.session_id ? (
              <div className="bg-surface-base p-3 rounded-lg border border-surface-border text-sm">
                <code className="text-[10px] text-slate-500 mb-1.5 block">{note.session_id}</code>
                {loadingSession ? (
                  <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Loading session details...
                  </div>
                ) : sessionDetails ? (
                  <div className="flex items-center gap-1 text-medical-green text-xs mt-1 font-medium bg-medical-green/10 px-2 py-1 rounded inline-flex border border-medical-green/20">
                    <CheckCircle className="w-3.5 h-3.5" /> 
                    Found: {sessionDetails.language === 'en' ? 'English' : sessionDetails.language === 'sn' ? 'ChiShona' : 'isiNdebele'}, {sessionDetails.completed_modules_count} modules
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-amber-500 text-xs mt-1 font-medium bg-amber-500/10 px-2 py-1 rounded inline-flex border border-amber-500/20">
                    <AlertCircle className="w-3.5 h-3.5" /> Session details unavailable
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No session linked</p>
            )}
          </div>

          <div className="flex justify-between items-center mt-2" onClick={(e) => e.stopPropagation()}>
            {confirmDelete ? (
              <div className="flex items-center gap-3 bg-medical-red/10 p-2.5 rounded-lg border border-medical-red/20 w-full animate-in zoom-in-95">
                <span className="text-sm text-medical-red font-medium flex-1">Delete this note? This cannot be undone.</span>
                <button 
                  onClick={() => setConfirmDelete(false)}
                  disabled={isDeleting}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-1.5 text-xs bg-medical-red hover:bg-red-600 text-white rounded-md transition-colors font-medium flex items-center gap-1 shadow-glow-red"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm"}
                </button>
              </div>
            ) : (
               <div className="flex justify-between items-center w-full">
                  <span className="text-xs text-slate-500 flex items-center gap-1 transition-colors group-hover:text-brand-400">
                    <ChevronUp className="w-4 h-4" /> Show less
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-medical-red transition-colors px-2 py-1 rounded hover:bg-medical-red/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


export default function RecentNotesList({ 
  notes, 
  onLoadMore, 
  isLoadingMore, 
  hasMore, 
  onNoteDeleted 
}: RecentNotesListProps) {
  
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface-elevated rounded-2xl border border-surface-border text-center">
        <div className="w-12 h-12 rounded-full bg-surface-base flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-slate-500" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No notes found</h3>
        <p className="text-sm text-slate-400">There are no radiographer notes recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <NoteCard 
          key={note.id} 
          note={note} 
          onNoteDeleted={onNoteDeleted} 
        />
      ))}

      {hasMore && (
        <div ref={observerTarget} className="py-6 flex justify-center">
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading more notes...
            </div>
          ) : (
            <div className="text-transparent h-4">scroll trigger</div>
          )}
        </div>
      )}
      
      {!hasMore && notes.length > 0 && (
        <div className="py-6 flex justify-center text-sm text-slate-500 font-medium">
          No more notes
        </div>
      )}
    </div>
  );
}
