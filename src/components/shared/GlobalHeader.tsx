"use client";

import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import LocaleSwitcher from "./LocaleSwitcher";
import type { Locale } from "@/types";

export function GlobalHeader({ locale }: { locale: Locale }) {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b border-white/[0.04] bg-surface-card/80 px-6 backdrop-blur-md transition-all duration-300">
      <Link 
        href={`/${locale}/modules`} 
        className="flex items-center gap-2.5 transition-opacity hover:opacity-80 active:scale-95 duration-200"
        aria-label="ClarityScans Home"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/20">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 2v20" />
            <path d="M2 12h20" />
          </svg>
        </div>
        <Logo className="hidden xs:block" />
      </Link>

      <div className="flex items-center gap-4">
        <LocaleSwitcher currentLocale={locale} />
      </div>
    </header>
  );
}
