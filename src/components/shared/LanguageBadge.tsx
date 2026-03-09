import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

interface LanguageBadgeProps {
  locale: Locale;
  size?: "sm" | "md";
  showFlag?: boolean;
  showLabel?: boolean;
  href?: string;
}

const FLAGS: Record<Locale, string> = {
  en: "🇬🇧",
  sn: "🇿🇼",
  nd: "🇿🇼",
};

const NATIVE_NAMES: Record<Locale, string> = {
  en: "English",
  sn: "ChiShona",
  nd: "isiNdebele",
};

export default function LanguageBadge({
  locale,
  size = "sm",
  showFlag = true,
  showLabel = true,
  href,
}: LanguageBadgeProps) {
  const classes = cn(
    "inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-surface-elevated font-display font-medium transition-colors",
    size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs",
    href && "hover:border-brand-500/30 hover:text-brand-400"
  );

  const content = (
    <>
      {showFlag && <span aria-hidden="true">{FLAGS[locale]}</span>}
      {showLabel && <span className="text-gray-300">{NATIVE_NAMES[locale]}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href as Route} className={classes}>
        {content}
      </Link>
    );
  }

  return <span className={classes}>{content}</span>;
}
