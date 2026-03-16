import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { Locale } from "@/types";
import LanguagePickerScreen from "@/components/patient/LanguagePickerScreen";
import { Suspense } from "react";

// Dynamic because we are actively reading cookies to show contextual visual hints
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ClarityScans — CT Patient Education",
  description: "Understand your CT scan in your own language",
  themeColor: "#0a0f1e",
};

export default function RootPage() {
  const cookieStore = cookies();
  const nextLocaleCookie = cookieStore.get("NEXT_LOCALE")?.value;
  
  // Safely infer the locale if it exists, otherwise pass null
  const suggestedLocale = (["en", "sn", "nd"].includes(nextLocaleCookie as string) 
    ? nextLocaleCookie 
    : null) as Locale | null;

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-surface-card"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>}>
      <LanguagePickerScreen suggestedLocale={suggestedLocale} />
    </Suspense>
  );
}
