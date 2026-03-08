import { VideoSlug } from "@/types";

export const COLORS = {
  brand: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },
  medical: {
    green: "#22c55e",
    red: "#ef4444",
    amber: "#f59e0b",
  },
  surface: {
    base: "#0a0f1e",
    card: "#0d1424",
    elevated: "#111827",
    border: "rgba(255,255,255,0.08)",
  },
} as const;

export const FONT_SIZES = {
  xs: "12px",
  sm: "14px",
  base: "16px",
  lg: "18px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "30px",
  "4xl": "36px",
} as const;

export const SPACING = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
} as const;

export const BORDER_RADIUS = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "20px",
  "3xl": "24px",
  full: "9999px",
} as const;

export const SHADOWS = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  glow: "0 0 40px rgba(14,165,233,0.25)",
  "glow-sm": "0 0 20px rgba(14,165,233,0.15)",
} as const;

export const ANIMATION_DURATION = {
  fast: 200,
  normal: 500,
  slow: 1000,
  breatheIn: 4000,
  breatheOut: 4000,
} as const;

export const BREATH_HOLD_TIMING = {
  INHALE_MS: 4000,
  HOLD_MS: 10000,
  EXHALE_MS: 4000,
  TOTAL_REPS: 3,
} as const;

export interface VideoModuleDef {
  slug: VideoSlug;
  icon: string;
  colorAccent: string;
  sortOrder: number;
  isImportant: boolean;
}

export const VIDEO_MODULES: VideoModuleDef[] = [
  { slug: "what-is-ct", icon: "Info", colorAccent: "brand-400", sortOrder: 1, isImportant: true },
  {
    slug: "prepare",
    icon: "CheckCircle",
    colorAccent: "brand-500",
    sortOrder: 2,
    isImportant: false,
  },
  {
    slug: "breathhold",
    icon: "RotateCcw",
    colorAccent: "medical-amber",
    sortOrder: 3,
    isImportant: true,
  },
  {
    slug: "contrast",
    icon: "Check",
    colorAccent: "medical-green",
    sortOrder: 4,
    isImportant: false,
  },
  {
    slug: "staying-still",
    icon: "Maximize",
    colorAccent: "medical-red",
    sortOrder: 5,
    isImportant: true,
  },
];

export interface VisualSignalDef {
  slug: string;
  emoji: string;
  color: string;
  translationKey: string;
}

export const VISUAL_SIGNALS: VisualSignalDef[] = [
  { slug: "ok", emoji: "👍", color: "medical-green", translationKey: "visual.signals.ok" },
  { slug: "stop", emoji: "✋", color: "medical-red", translationKey: "visual.signals.stop" },
  { slug: "unwell", emoji: "🤢", color: "medical-amber", translationKey: "visual.signals.unwell" },
  {
    slug: "understand",
    emoji: " nods",
    color: "brand-400",
    translationKey: "visual.signals.understand",
  },
  { slug: "confused", emoji: "❓", color: "brand-500", translationKey: "visual.signals.confused" },
  {
    slug: "anxious",
    emoji: "😰",
    color: "surface-border",
    translationKey: "visual.signals.anxious",
  },
];
