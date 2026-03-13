"use client";

import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { Check, Loader2, AlertTriangle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import YesNoToggle from "@/components/patient/YesNoToggle";
import { buttonStyles } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { LOCALES, Locale } from "@/types";
import { createNoteSchema, CreateNoteInput } from "@/lib/validations";
import { adminFetch } from "@/lib/adminFetch";
import { handleClientError } from "@/lib/globalErrorHandler";

interface NewNoteFormProps {
  onNoteAdded: (note: any) => void;
}

export default function NewNoteForm({ onNoteAdded }: NewNoteFormProps) {
  // Field States
  const [followedBreathhold, setFollowedBreathhold] = useState<boolean>(true);
  const [repeatScanRequired, setRepeatScanRequired] = useState<boolean>(false);
  const [languageUsed, setLanguageUsed] = useState<Locale>("en");
  const [sessionId, setSessionId] = useState("");
  const [comments, setComments] = useState("");

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [flashingFields, setFlashingFields] = useState(false);

  // Session Lookup States
  const [sessionLookupStatus, setSessionLookupStatus] = useState<"idle" | "loading" | "found" | "not_found">("idle");
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [autoLinkedMessage, setAutoLinkedMessage] = useState<string | null>(null);

  // Initialize from sessionStorage
  useEffect(() => {
    // 1. Restore Language
    const lastLang = sessionStorage.getItem("cs_last_note_lang") as Locale | null;
    if (lastLang && ["en", "sn", "nd"].includes(lastLang)) {
      setLanguageUsed(lastLang);
    }
    
    // 2. Restore Shortcuts Panel State
    const shortcutsState = localStorage.getItem("cs_notes_shortcuts_open");
    if (shortcutsState === "true") setShowShortcuts(true);

    // 3. Auto-link recent session
    const compTime = sessionStorage.getItem("cs_breathhold_completed_at");
    const recSessionId = sessionStorage.getItem("cs_session_id");
    
    if (compTime && recSessionId) {
      const msSince = Date.now() - parseInt(compTime, 10);
      if (msSince < 2 * 60 * 60 * 1000) { // 2 hours
        setSessionId(recSessionId);
        setAutoLinkedMessage("Auto-linked from recent patient session — verify this is the correct patient.");
        lookupSession(recSessionId);
      }
    }

    // 4. Restore draft from sessionStorage
    const draft = sessionStorage.getItem("cs_notes_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.comments) setComments(parsed.comments);
        if (parsed.sessionId) setSessionId(parsed.sessionId);
        if (parsed.languageUsed && ["en", "sn", "nd"].includes(parsed.languageUsed)) {
          setLanguageUsed(parsed.languageUsed);
        }
        if (typeof parsed.followedBreathhold === "boolean") setFollowedBreathhold(parsed.followedBreathhold);
        if (typeof parsed.repeatScanRequired === "boolean") setRepeatScanRequired(parsed.repeatScanRequired);
      } catch {
        sessionStorage.removeItem("cs_notes_draft");
      }
    }
  }, []);

  // Auto-save draft to sessionStorage on field changes
  useEffect(() => {
    const draft = { comments, sessionId, languageUsed, followedBreathhold, repeatScanRequired };
    // Only save if there's meaningful data
    if (comments || sessionId) {
      sessionStorage.setItem("cs_notes_draft", JSON.stringify(draft));
    }
  }, [comments, sessionId, languageUsed, followedBreathhold, repeatScanRequired]);

  const lookupSession = async (id: string) => {
    // Validate format first visually
    const uuidSchema = z.string().uuid();
    if (!uuidSchema.safeParse(id).success) {
      setSessionLookupStatus("idle");
      return;
    }

    setSessionLookupStatus("loading");
    try {
      const res = await adminFetch(`/api/admin/sessions/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSessionLookupStatus("found");
        setSessionDetails(data.data);
        // Auto-update language from session if found
        if (data.data.language) {
          setLanguageUsed(data.data.language as Locale);
        }
      } else {
        setSessionLookupStatus("not_found");
        setSessionDetails(null);
      }
    } catch (error) {
      handleClientError(error, "NewNoteForm - lookupSession");
      setSessionLookupStatus("not_found");
      setSessionDetails(null);
    }
  };

  const handleSessionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setSessionId(val);
    setAutoLinkedMessage(null); // Clear auto-link message if they edit manually
    if (val.length === 36) {
      lookupSession(val);
    } else {
      setSessionLookupStatus("idle");
      setSessionDetails(null);
    }
  };

  const triggerFieldFlash = () => {
    setFlashingFields(true);
    setTimeout(() => setFlashingFields(false), 300);
  };

  const applyPreset1 = useCallback(() => {
    setFollowedBreathhold(true);
    setRepeatScanRequired(false);
    triggerFieldFlash();
  }, []);

  const applyPreset2 = useCallback(() => {
    setFollowedBreathhold(false);
    setRepeatScanRequired(true);
    triggerFieldFlash();
  }, []);

  const applyPreset3 = useCallback(() => {
    setFollowedBreathhold(true);
    setRepeatScanRequired(true);
    triggerFieldFlash();
  }, []);

  const resetFormToDefaults = useCallback(() => {
    setFollowedBreathhold(true);
    setRepeatScanRequired(false);
    setSessionId("");
    setComments("");
    setSessionLookupStatus("idle");
    setSessionDetails(null);
    setAutoLinkedMessage(null);
    setValidationError(null);
    setErrorToast(null);
    sessionStorage.removeItem("cs_notes_draft");
  }, []);

  useKeyboardShortcuts(
    {
      "Digit1": applyPreset1,
      "Digit2": applyPreset2,
      "Digit3": applyPreset3,
      "Escape": resetFormToDefaults,
    },
    !isSubmitting
  );

  const handleSubmit = async () => {
    if (isSubmitting || submitSuccess) return;
    
    setValidationError(null);
    setErrorToast(null);

    const payload: Partial<CreateNoteInput> = {
      followedBreathhold,
      repeatScanRequired,
      languageUsed,
    };
    
    if (sessionId) {
      if (!z.string().uuid().safeParse(sessionId).success) {
        setValidationError("Session ID must be a valid UUID format");
        return;
      }
      payload.sessionId = sessionId;
    }
    
    if (comments) payload.comments = comments;

    const validation = createNoteSchema.safeParse(payload);
    if (!validation.success) {
      // Find first error
      const firstErr = validation.error.errors[0];
      setValidationError(firstErr.message);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      const data = await res.json();
      
      if (data.success) {
        setSubmitSuccess(true);
        onNoteAdded(data.data);
        sessionStorage.setItem("cs_last_note_lang", languageUsed);
        sessionStorage.removeItem("cs_notes_draft");
        
        setTimeout(() => {
          setSubmitSuccess(false);
          resetFormToDefaults();
          setIsSubmitting(false);
        }, 1500);
      } else {
        throw new Error(data.error || "Failed to save note");
      }
    } catch (error: any) {
      handleClientError(error, "NewNoteForm - handleSubmit");
      setErrorToast(error.message || "Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleGlobalKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleShortcuts = () => {
    const next = !showShortcuts;
    setShowShortcuts(next);
    localStorage.setItem("cs_notes_shortcuts_open", String(next));
  };

  const isFormDisabled = isSubmitting || submitSuccess;

  // UUID validation for inline error
  let sessionFormatError = false;
  if (sessionId && sessionId.length > 0) {
    sessionFormatError = !z.string().uuid().safeParse(sessionId).success;
  }

  return (
    <div 
      className="bg-surface-elevated rounded-2xl border border-surface-border p-5 flex flex-col h-full"
      onKeyDown={handleGlobalKeyDown}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">New Note</h2>
        
        <div className="flex bg-surface-base rounded-lg p-1 border border-surface-border/50">
          <button
            onClick={applyPreset1}
            disabled={isFormDisabled}
            className="px-3 py-1.5 text-xs font-medium bg-transparent hover:bg-white/5 disabled:opacity-50 text-slate-300 rounded-md transition-colors"
          >
            ✅ All Good
          </button>
          <button
            onClick={applyPreset2}
            disabled={isFormDisabled}
            className="px-3 py-1.5 text-xs font-medium bg-transparent hover:bg-white/5 disabled:opacity-50 text-slate-300 rounded-md transition-colors border-l border-white/5"
          >
            🔄 Repeat Scan
          </button>
          <button
            onClick={applyPreset3}
            disabled={isFormDisabled}
            className="px-3 py-1.5 text-xs font-medium bg-transparent hover:bg-white/5 disabled:opacity-50 text-slate-300 rounded-md transition-colors border-l border-white/5"
          >
            ⚠️ Repeat Despite Instructions
          </button>
        </div>
      </div>

      <div className={cn("space-y-6 flex-1 transition-all", flashingFields && "opacity-60")}>
        
        {/* Toggle Fields Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300 block">Patient followed breath-hold instructions</label>
            <YesNoToggle 
              value={followedBreathhold} 
              onChange={setFollowedBreathhold} 
              yesLabel="Yes" 
              noLabel="No" 
              disabled={isFormDisabled}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300 block">Repeat scan was required</label>
            <YesNoToggle 
              value={repeatScanRequired} 
              onChange={setRepeatScanRequired} 
              yesLabel="Yes" 
              noLabel="No" 
              disabled={isFormDisabled}
            />
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-300 block">Language Used</label>
          <div className="flex gap-2" role="radiogroup">
            {[
              { id: "en", label: "English" },
              { id: "sn", label: "ChiShona" },
              { id: "nd", label: "isiNdebele" },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                role="radio"
                disabled={isFormDisabled}
                aria-checked={languageUsed === lang.id}
                onClick={() => setLanguageUsed(lang.id as Locale)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-all border",
                  languageUsed === lang.id
                    ? "bg-brand-500/20 text-brand-400 border-brand-500/50"
                    : "bg-surface-base text-slate-400 border-surface-border hover:bg-white/5 hover:text-slate-300",
                  isFormDisabled && "opacity-50"
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Session ID */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 flex justify-between">
            <span>Session ID <span className="text-slate-500 font-normal">(Optional)</span></span>
          </label>
          <input
            type="text"
            value={sessionId}
            onChange={handleSessionChange}
            disabled={isFormDisabled}
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            className="w-full bg-surface-base border border-surface-border text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-slate-600 font-mono"
            spellCheck={false}
          />
          
          <div className="min-h-[20px]">
            {autoLinkedMessage && (
              <p className="text-xs text-brand-400 flex flex-wrap items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                {autoLinkedMessage}
              </p>
            )}
            
            {!autoLinkedMessage && sessionFormatError && sessionId.length > 5 && (
              <p className="text-xs text-amber-500 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Invalid UUID format
              </p>
            )}
            
            {!autoLinkedMessage && !sessionFormatError && sessionLookupStatus === "found" && sessionDetails && (
              <p className="text-xs text-medical-green flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Session found — {sessionDetails.language === 'en' ? 'English' : sessionDetails.language === 'sn' ? 'ChiShona' : 'isiNdebele'}, {sessionDetails.completed_modules_count} modules watched, started {new Date(sessionDetails.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}

            {!autoLinkedMessage && !sessionFormatError && sessionLookupStatus === "not_found" && (
              <p className="text-xs text-amber-500 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Session not found — note will be saved without a connected link.
              </p>
            )}

            {!autoLinkedMessage && !sessionFormatError && sessionLookupStatus === "idle" && !sessionId && (
              <p className="text-xs text-slate-500">Find session ID in the analytics table URL.</p>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-2 flex-grow flex flex-col">
          <label className="text-sm font-medium text-slate-300 flex justify-between">
            <span>Comments <span className="text-slate-500 font-normal">(Optional)</span></span>
            <span className={cn(
              "text-xs",
              1000 - comments.length <= 200 ? "text-amber-500 font-medium animate-pulse" : "text-slate-500"
            )}>
              {1000 - comments.length <= 200 ? `${1000 - comments.length} characters remaining` : `${comments.length}/1000`}
            </span>
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value.slice(0, 1000))}
            disabled={isFormDisabled}
            className="w-full bg-surface-base border border-surface-border text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-600 resize-none flex-grow min-h-[100px]"
            placeholder="e.g. patient was confused about contrast injection, needed verbal reassurance..."
          />
        </div>

        {validationError && (
          <div className="p-3 rounded-lg bg-medical-red/10 border border-medical-red/20 text-medical-red text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{validationError}</p>
          </div>
        )}

      </div>

      <div className="mt-6 pt-4 border-t border-surface-border">
        {errorToast && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <p>{errorToast}</p>
            </div>
            <button 
              onClick={() => handleSubmit()}
              className="text-amber-500 hover:text-amber-400 font-medium px-2 py-1 rounded hover:bg-amber-500/10 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isFormDisabled}
          className={cn(
            buttonStyles("primary", "lg"),
            "w-full transition-all duration-300 font-semibold shadow-md",
            submitSuccess && "bg-medical-green hover:bg-medical-green border-medical-green text-white shadow-glow-green"
          )}
        >
          {submitSuccess ? (
            <span className="flex items-center gap-2 justify-center text-green-950 font-bold">
              <Check className="w-5 h-5" /> Saved ✓
            </span>
          ) : isSubmitting ? (
            <span className="flex items-center gap-2 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" /> Saving
            </span>
          ) : (
            "Save Note"
          )}
        </button>

        <div className="mt-4">
          <button
            onClick={toggleShortcuts}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium cursor-pointer py-1"
          >
            {showShortcuts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Keyboard shortcuts ⌨
          </button>
          
          {showShortcuts && (
            <div className="mt-2 grid grid-cols-2 gap-y-2 gap-x-4 p-3 rounded-lg bg-surface-base border border-surface-border text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Submit form</span>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated font-mono text-[10px] text-slate-300">Ctrl+↵</kbd>
              </div>
              <div className="flex justify-between">
                <span>Clear form</span>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated font-mono text-[10px] text-slate-300">Esc</kbd>
              </div>
              <div className="flex justify-between">
                <span>All Good preset</span>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated font-mono text-[10px] text-slate-300">1</kbd>
              </div>
              <div className="flex justify-between">
                <span>Repeat Scan preset</span>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated font-mono text-[10px] text-slate-300">2</kbd>
              </div>
              <div className="flex justify-between">
                <span>Partial Success</span>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated font-mono text-[10px] text-slate-300">3</kbd>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
