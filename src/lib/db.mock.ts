import {
  Locale,
  VideoRecord,
  VideoSlug,
  SessionRecord,
  FeedbackRecord,
  RadioNoteRecord,
} from "@/types";
import { CreateFeedbackInput, CreateNoteInput, UpsertVideoInput } from "./validations";
import { FeedbackSummary } from "./queries/feedback";
import { NotesSummary } from "./queries/radiographerNotes";

export const USE_MOCK_DB = !process.env.DATABASE_URL;

// --- Mock Data Store ---
let mockVideos: VideoRecord[] = [
  {
    id: "v1",
    slug: "what-is-ct",
    language: "en",
    title: "What is a CT Scan?",
    description: "...",
    blob_url: "PLACEHOLDER",
    thumbnail_url: null,
    duration_seconds: 120,
    sort_order: 1,
    is_active: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "v2",
    slug: "prepare",
    language: "en",
    title: "Getting Ready",
    description: "...",
    blob_url: "PLACEHOLDER",
    thumbnail_url: null,
    duration_seconds: 180,
    sort_order: 2,
    is_active: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "v3",
    slug: "breathhold",
    language: "en",
    title: "Breath Hold Practice",
    description: "...",
    blob_url: "PLACEHOLDER",
    thumbnail_url: null,
    duration_seconds: 90,
    sort_order: 3,
    is_active: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "v4",
    slug: "contrast",
    language: "en",
    title: "Contrast Dye",
    description: "...",
    blob_url: "PLACEHOLDER",
    thumbnail_url: null,
    duration_seconds: 150,
    sort_order: 4,
    is_active: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "v5",
    slug: "staying-still",
    language: "en",
    title: "Staying Still",
    description: "...",
    blob_url: "PLACEHOLDER",
    thumbnail_url: null,
    duration_seconds: 120,
    sort_order: 5,
    is_active: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

let mockSessions: SessionRecord[] = [
  {
    id: "s1",
    language: "en",
    device_type: "tablet",
    started_at: new Date(),
    completed_modules: ["what-is-ct"],
  },
  {
    id: "s2",
    language: "en",
    device_type: "phone",
    started_at: new Date(Date.now() - 86400000),
    completed_modules: ["what-is-ct", "prepare"],
  },
  {
    id: "s3",
    language: "sn",
    device_type: "tablet",
    started_at: new Date(Date.now() - 172800000),
    completed_modules: [],
  },
];

let mockFeedback: FeedbackRecord[] = [
  {
    id: "f1",
    session_id: "s1",
    understood_procedure: true,
    anxiety_before: 4,
    anxiety_after: 2,
    app_helpful: true,
    comments: null,
    submitted_by: "patient",
    created_at: new Date(),
  },
  {
    id: "f2",
    session_id: "s2",
    understood_procedure: true,
    anxiety_before: 5,
    anxiety_after: 3,
    app_helpful: true,
    comments: "Very good",
    submitted_by: "patient",
    created_at: new Date(Date.now() - 86400000),
  },
  {
    id: "f3",
    session_id: "s3",
    understood_procedure: false,
    anxiety_before: 3,
    anxiety_after: 3,
    app_helpful: false,
    comments: null,
    submitted_by: "patient",
    created_at: new Date(Date.now() - 172800000),
  },
];

let mockNotes: RadioNoteRecord[] = [
  {
    id: "n1",
    session_id: "s1",
    followed_breathhold: true,
    repeat_scan_required: false,
    language_used: "en",
    comments: null,
    created_at: new Date(),
  },
  {
    id: "n2",
    session_id: "s2",
    followed_breathhold: false,
    repeat_scan_required: true,
    language_used: "sn",
    comments: "Patient sneezed",
    created_at: new Date(Date.now() - 86400000),
  },
];

function uuid() {
  return Math.random().toString(36).substring(2, 15);
}

// --- Videos ---
export async function getVideosByLanguage(language: Locale): Promise<VideoRecord[]> {
  return mockVideos
    .filter((v) => v.language === language && v.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function getVideoBySlug(
  slug: VideoSlug,
  language: Locale
): Promise<VideoRecord | null> {
  return mockVideos.find((v) => v.slug === slug && v.language === language && v.is_active) || null;
}

export async function getAllVideos(): Promise<VideoRecord[]> {
  return [...mockVideos].sort(
    (a, b) => a.language.localeCompare(b.language) || a.sort_order - b.sort_order
  );
}

export async function upsertVideo(data: UpsertVideoInput): Promise<VideoRecord> {
  const existing = mockVideos.find((v) => v.slug === data.slug && v.language === data.language);
  if (existing) {
    Object.assign(existing, {
      title: data.title,
      description: data.description || null,
      blob_url: data.blobUrl,
      thumbnail_url: data.thumbnailUrl || null,
      duration_seconds: data.durationSeconds || null,
      is_active: data.isActive ?? true,
    });
    return { ...existing };
  }
  const novel: VideoRecord = {
    id: uuid(),
    slug: data.slug as VideoSlug,
    language: data.language as Locale,
    title: data.title,
    description: data.description || "",
    blob_url: data.blobUrl,
    thumbnail_url: data.thumbnailUrl || null,
    duration_seconds: data.durationSeconds || null,
    sort_order: mockVideos.length + 1,
    is_active: data.isActive ?? true,
    created_at: new Date(),
    updated_at: new Date(),
  };
  mockVideos.push(novel);
  return { ...novel };
}

export async function updateVideoActiveStatus(id: string, isActive: boolean): Promise<void> {
  const v = mockVideos.find((v) => v.id === id);
  if (v) v.is_active = isActive;
}

export async function deleteVideo(id: string): Promise<void> {
  mockVideos = mockVideos.filter((v) => v.id !== id);
}

// --- Sessions ---
export async function createSession(
  language: Locale,
  deviceType: SessionRecord["device_type"]
): Promise<SessionRecord> {
  const s: SessionRecord = {
    id: uuid(),
    language,
    device_type: deviceType,
    started_at: new Date(),
    completed_modules: [],
  };
  mockSessions.push(s);
  return { ...s };
}

export async function updateSessionModules(
  sessionId: string,
  completedModules: VideoSlug[]
): Promise<void> {
  const s = mockSessions.find((s) => s.id === sessionId);
  if (s) {
    s.completed_modules = completedModules;
  }
}

export async function getSessionById(id: string): Promise<SessionRecord | null> {
  return mockSessions.find((s) => s.id === id) || null;
}

/* eslint-disable no-unused-vars */
export async function touchSession(_sessionId: string): Promise<void> {
  // Mock does not track last_active_at in the exact SessionRecord type
}
/* eslint-enable no-unused-vars */

// --- Feedback ---
export async function createFeedback(data: CreateFeedbackInput): Promise<FeedbackRecord> {
  const f: FeedbackRecord = {
    id: uuid(),
    session_id: data.sessionId,
    understood_procedure: data.understoodProcedure ?? null,
    anxiety_before: (data.anxietyBefore as FeedbackRecord["anxiety_before"]) ?? null,
    anxiety_after: (data.anxietyAfter as FeedbackRecord["anxiety_after"]) ?? null,
    app_helpful: data.appHelpful ?? null,
    comments: data.comments ?? null,
    submitted_by: data.submittedBy,
    created_at: new Date(),
  };
  mockFeedback.unshift(f);
  return { ...f };
}

/* eslint-disable no-unused-vars */
export async function getFeedbackSummary(
  _dateRange: "week" | "month" | "all"
): Promise<FeedbackSummary> {
  return {
    totalSessions: mockSessions.length,
    avgAnxietyBefore: 4,
    avgAnxietyAfter: 2,
    avgAnxietyReduction: 2,
    helpfulRate: 0.9,
    understoodRate: 0.85,
    totalFeedback: mockFeedback.length,
    positiveReductionRate: 0.8,
    distributionBefore: { "1": 0, "2": 0, "3": 1, "4": 1, "5": 1 },
    distributionAfter: { "1": 0, "2": 1, "3": 2, "4": 0, "5": 0 },
    dailyCounts: [],
    languageDistribution: { en: 0, sn: 0, nd: 0 } as Record<Locale, number>,
  };
}
/* eslint-enable no-unused-vars */

export async function getAllFeedback(
  page: number,
  pageSize: number
): Promise<{ rows: FeedbackRecord[]; total: number }> {
  const start = (page - 1) * pageSize;
  const data = mockFeedback.slice(start, start + pageSize);
  return { rows: [...data], total: mockFeedback.length };
}

// --- Radiographer Notes ---
export async function createNote(data: CreateNoteInput): Promise<RadioNoteRecord> {
  const n: RadioNoteRecord = {
    id: uuid(),
    session_id: data.sessionId || "unknown_session",
    followed_breathhold: data.followedBreathhold,
    repeat_scan_required: data.repeatScanRequired,
    language_used: data.languageUsed as Locale,
    comments: data.comments ?? null,
    created_at: new Date(),
  };
  mockNotes.unshift(n);
  return { ...n };
}

/* eslint-disable no-unused-vars */
export async function getNotesSummary(_dateRange: "week" | "month" | "all"): Promise<NotesSummary> {
  return {
    totalNotes: mockNotes.length,
    breathholdComplianceRate: 0.5,
    repeatScanRate: 0.5,
    languageDistribution: {
      en: 2,
      sn: 0,
      nd: 0,
    },
  };
}
/* eslint-enable no-unused-vars */

export async function getAllNotes(
  page: number,
  pageSize: number
): Promise<{ rows: RadioNoteRecord[]; total: number }> {
  const start = (page - 1) * pageSize;
  const data = mockNotes.slice(start, start + pageSize);
  return { rows: [...data], total: mockNotes.length };
}
