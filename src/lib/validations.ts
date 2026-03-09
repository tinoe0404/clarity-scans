import { z } from "zod";

export const localeSchema = z.enum(["en", "sn", "nd"]);

export const createFeedbackSchema = z.object({
  sessionId: z.string().uuid(),
  understoodProcedure: z.boolean().nullable().optional(),
  anxietyBefore: z.number().int().min(1).max(5).nullable().optional(),
  anxietyAfter: z.number().int().min(1).max(5).nullable().optional(),
  appHelpful: z.boolean().nullable().optional(),
  comments: z.string().max(500, "Comments cannot exceed 500 characters").nullable().optional(),
  submittedBy: z.enum(["patient", "radiographer"]),
});
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;

export const createNoteSchema = z.object({
  sessionId: z.string().uuid(),
  followedBreathhold: z.boolean(),
  repeatScanRequired: z.boolean(),
  languageUsed: localeSchema,
  comments: z.string().max(1000, "Notes cannot exceed 1000 characters").nullable().optional(),
  radiographerId: z.string().max(100).nullable().optional(),
});
export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export const upsertVideoSchema = z.object({
  slug: z.string().min(1).max(100),
  language: localeSchema,
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  blobUrl: z.string().url(),
  thumbnailUrl: z.string().url().nullable().optional(),
  durationSeconds: z.number().int().min(0).nullable().optional(),
  isActive: z.boolean().optional().default(true),
});
export type UpsertVideoInput = z.infer<typeof upsertVideoSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const dateRangeSchema = z.enum(["week", "month", "all"]).default("week");
