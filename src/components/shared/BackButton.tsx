"use client";

import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/lib/styles";

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  label?: string;
  className?: string;
}

export default function BackButton({ href, onClick, label, className }: BackButtonProps) {
  const ariaLabel = label || "Go back";
  const classes = cn(buttonStyles("ghost", "sm"), "gap-2", className);

  if (href) {
    return (
      <Link href={href as Route} className={classes} aria-label={ariaLabel}>
        <ArrowLeft className="h-5 w-5" />
        {label && <span>{label}</span>}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes} aria-label={ariaLabel}>
      <ArrowLeft className="h-5 w-5" />
      {label && <span>{label}</span>}
    </button>
  );
}
